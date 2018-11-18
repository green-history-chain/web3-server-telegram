'use strict';

import { Response, Request } from 'express';
import * as config from 'config';
import { Eth, EthConfig } from '../libs/eth';

class ContractController {
  public settings: EthConfig;

  constructor (settings?: EthConfig) {
    this.settings = settings || config.get('eth');
  }

  /**
   * GET /eth/contracts
   * List available predefined contracts
   */
  list = async (req: Request, res: Response) => {
    const eth = await Eth.create(this.settings);
    const available = await eth.getPredefinedContractList();

    res.json(available);
  }

  /**
   * GET /eth/contracts/:id
   * Get predefined contract
   */
  get = async (req: Request, res: Response) => {
    const eth = await Eth.create(this.settings);

    if (!eth.isSolidityFilename(req.params.id)) {
      return res.status(400).send('Contract must end with a .sol extension');
    }

    const contract = await eth.getPredefinedContract(req.params.id);

    if (!contract) {
      return res.status(404).send('Not found');
    }

    res.json(contract);
  }

  /**
   * POST /eth/contracts/id
   * Invoke methods on predefined contract or instantiate it
   */
  invoke = async (req: Request, res: Response) => {
    const eth = await Eth.create(this.settings);

    if (!req.body) {
      return res.status(400).send('Invalid payload');
    }

    if (!req.params.id) {
      return res.status(400).send('Contract not given');
    }

    if (req.body.address && !req.body.method) {
      return res.status(400).send('Address was given but method was not');
    }

    if (!eth.isSolidityFilename(req.params.id)) {
      return res.status(400).send('Contract must end with a .sol extension');
    }

    const contract = await eth.getPredefinedContract(req.params.id);

    if (!contract) {
      return res.status(404).send('Not found');
    }

    let result = null;

    try {
      result = req.body.address ?
        await eth.invokeContractMethod(contract, req.body.address, req.body.method, req.body.params, req.body.callback_url) :
        await eth.deployNewContract(contract, req.body.params || [], req.body.callback_url);
    } catch (e) {
      return res.status(400).send(`Failed to interact with contract:\n\n${e}`);
    }

    if (req.body.callback_url) {
      return res.status(202).send('Request is deferred');
    }

    res.json(result);
  }
}

const contractController = new ContractController();

export { ContractController, contractController };
