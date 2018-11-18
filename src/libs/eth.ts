'use strict';

import * as fs from 'fs';
import * as request from 'request';
import * as Web3 from 'web3';
import * as TestRPC from 'ethereumjs-testrpc';

interface EthConfig {
  web3: {
    url: string;
    address?: string;
  };
}

interface EthContract {
  sol: string;
  abi: Object;
  bytecode: string;
  gas: number;
}

interface EthTransaction {
  transaction?: string;
  from?: string;
  to?: string;
  gas?: number;
  result?: any;
}

class Eth {
  public config: EthConfig;
  public web3: any;

  constructor (config: EthConfig, web3?: any) {
    this.config = config;
    this.web3 = web3;
  }

  static async create (config: EthConfig): Promise<Eth> {
    const eth = new this(config, new Web3());

    eth.web3.setProvider(new Web3.providers.HttpProvider(config.web3.url));

    await eth.setDefaultAccount(config.web3.address);

    return eth;
  }

  startTestRpcServer (port: number): Promise<any> {
    return new Promise((resolve, reject) => {
      TestRPC.server().listen(port, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }

  startNode (): Promise<any> {
    return this.startTestRpcServer(8545);
  }

  getSyncing (): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getSyncing((err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }

  getApiVersion (): string {
    return this.web3.version.api;
  }

  getNodeVersion (): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.version.getNode((err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }

  getNetworkVersion (name: boolean = true): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.version.getNetwork((err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(name ? this.getNetworkNameById(res) : res);
      });
    });
  }

  getNetworkNameById (id: string): string {
    switch (id) {
      case '1':
        return 'Main';
      case '2':
        return 'Morden';
      case '3':
        return 'Ropsten';
      case '4':
        return 'Rinkeby';
      case '42':
        return 'Kovan';
      default:
        return 'Unknown';
    }
  }

  getAccounts (): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }

  getDefaultAccount () {
    return this.web3.defaultAccount || null;
  }

  setDefaultAccount (address?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (address) {
        this.web3.defaultAccount = address;
        return resolve(this.web3.defaultAccount);
      }

      const accounts = this.getAccounts().then((res: any) => {
        this.web3.defaultAccount = res[0];
        resolve(this.web3.defaultAccount);
      });
    });
  }
  getBalance (address: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!address) {
        return resolve(0);
      }

      this.web3.eth.getBalance(address, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        resolve(this.web3.fromWei(res, 'ether'));
      });
    });
  }

  async getPredefinedContractList (): Promise<Array<string>> {
    const contracts = await this.getFolderContents('./src/contracts');
    const formatted = contracts.map((contract: string) => `${contract}.sol`);

    return formatted;
  }

  async getPredefinedContract (id: string): Promise<EthContract> {
    const folder = this.removeFileExtension(id);
    const files = await this.getFolderContents(`./src/contracts/${folder}`);

    if (!files) {
      return;
    }

    let sol = await this.getFileContents(`./src/contracts/${folder}/contract.sol`);
    sol = sol ? sol.trim() : null;

    let abi = await this.getFileContents(`./src/contracts/${folder}/contract.abi`);
    abi = abi ? JSON.parse(abi) : null;

    let bytecode = await this.getFileContents(`./src/contracts/${folder}/contract.bytecode`);
    bytecode = bytecode ? bytecode.trim() : null;

    if (bytecode && !bytecode.startsWith('0x')) {
      bytecode = `0x${bytecode}`;
    }

    const gas = bytecode ? await this.estimateGas(bytecode) : null;

    return { sol, abi, bytecode, gas };
  }

  protected getFolderContents (folder: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      fs.readdir(folder, (err: any, res: any) => {
        if (err) {
          return resolve(null);
        }

        resolve(res);
      });
    });
  }

  protected getFileContents (filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, { encoding: 'utf8' }, (err: any, res: any) => {
        if (err) {
          return resolve(null);
        }

        resolve(res);
      });
    });
  }

  protected getFileExtension (filename: string): string {
    return filename.split('.').pop();
  }

  protected removeFileExtension (filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
  }

  isSolidityFilename (filename: string): boolean {
    return (/\.(sol)$/i).test(filename);
  }

  getContractInterface (abi: Object): any {
    const Contract = this.web3.eth.contract(abi);
    Contract.eth.defaultAccount = this.getDefaultAccount();

    return Contract;
  }

  async deployNewContract (contract: EthContract, params: Array<any>, callbackUrl?: string): Promise<EthTransaction> {
    const ContractInterface = this.getContractInterface(contract.abi);
    const simulation = ContractInterface.new.getData(...params, { data: contract.bytecode });
    const gas = await this.estimateGas(simulation);
    const result: EthTransaction = {};

    return new Promise((resolve, reject) => {
      ContractInterface.new(...params, { data: contract.bytecode, gas: gas }, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        if (callbackUrl) {
          // end the request early
          resolve();
        }

        if (res.address) {
          // address is only returned the second time the callback is executed
          result.from = ContractInterface.eth.defaultAccount;
          result.to = res.address;
          result.transaction = res.transactionHash;
          result.gas = gas;

          if (callbackUrl) {
            this.invokeCallbackUrl(callbackUrl, result);
          } else {
            return resolve(result);
          }
        }
      });
    });
  }

  async invokeContractMethod (contract: EthContract, address: string, method: string, params: Array<any>, callbackUrl?: string): Promise<EthTransaction> {
    if (params && params.length) {
      return this.invokeWithParams(contract, address, method, params, callbackUrl);
    } else {
      return this.invokeWithoutParams(contract, address, method, callbackUrl);
    }
  }

  protected async invokeWithoutParams (contract: EthContract, address: string, method: string, callbackUrl?: string): Promise<EthTransaction> {
    const ContractInterface = this.getContractInterface(contract.abi);
    const contractInstance = ContractInterface.at(address);
    const gas = await this.estimateGasContractInvocation(contractInstance, method);
    const result: EthTransaction = {};

    return new Promise((resolve, reject) => {
      contractInstance[method]({ gas: gas }, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        if (callbackUrl) {
          // end the request early
          resolve();
        }

        result.from = ContractInterface.eth.defaultAccount;
        result.to = address;
        result.result = res;
        result.gas = gas;

        if (callbackUrl) {
          this.invokeCallbackUrl(callbackUrl, result);
        } else {
          return resolve(result);
        }
      });
    });
  }

  async invokeWithParams (contract: EthContract, address: string, method: string, params: Array<any>, callbackUrl?: string): Promise<EthTransaction> {
    const ContractInterface = this.getContractInterface(contract.abi);
    const contractInstance = ContractInterface.at(address);
    const gas = await this.estimateGasContractInvocation(contractInstance, method, params);
    const result: EthTransaction = {};

    return new Promise((resolve, reject) => {
      contractInstance[method](...params, { gas: gas }, (err: any, res: any) => {
        if (err) {
          return reject(err);
        }

        if (callbackUrl) {
          // end the request early
          resolve();
        }

        result.from = ContractInterface.eth.defaultAccount;
        result.to = address;
        result.result = res;
        result.gas = gas;

        if (callbackUrl) {
          this.invokeCallbackUrl(callbackUrl, result);
        } else {
          return resolve(result);
        }
      });
    });
  }

  estimateGas (bytecode: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth.estimateGas({ data: bytecode }, (err: any, res: any) => this.resolve(err, res, reject, resolve));
    });
  }

  estimateGasContractInvocation (instance: any, method: string, params?: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (params) {
        return instance[method].estimateGas(...params, (err: any, res: any) => this.resolve(err, res, reject, resolve));
      }

      instance[method].estimateGas((err: any, res: any) => this.resolve(err, res, reject, resolve));
    });
  }

  protected resolve(err: any, res: any, reject: any, resolve: any): Promise<any> {
    if (err) {
      return reject(err);
    }

    resolve(res);
  }

  async invokeCallbackUrl(url: string, data: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      return request.post({ url, json: data }, (err, res, body) => this.resolve(err, res, reject, resolve));
    });
  }
}

export { Eth, EthConfig, EthContract, EthTransaction };
