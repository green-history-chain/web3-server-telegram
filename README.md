# Web3 server

This webserver provides an interface to communicate with [Ethereum Smart Contracts](http://solidity.readthedocs.io/en/develop/introduction-to-smart-contracts.html) over HTTP.

## Requirements

- [Node.js](https://nodejs.org/en/download/) >= 6.8.1
- [Npm](https://www.npmjs.com/get-npm/) >= 3.10.8
- [Geth](https://geth.ethereum.org/downloads/) >= 1.6.6

## Installation

Clone the repository

```
git clone git@github.com:legalthings/web3-server.git
```

Install dependencies

```
cd <project_name>
npm install
```

Build and run the project

```
npm start
```

## Ethereum node

The project by default runs [TestRPC](https://github.com/ethereumjs/testrpc) on `http://localhost:8545`.
This is useful for development and testing because its fast.
However, if the server restarts the stored state is reset.

For production you should run your own node via [Geth](https://geth.ethereum.org/downloads/) and then configure the url/port to a different endpoint.

## Configuration

Configuration can be found [here](https://github.com/legalthings/web3-server/tree/master/src/config).
Each environment and hostname can have its [own configuration file](https://github.com/lorenwest/node-config/wiki/Configuration-Files#file-load-order).

## Environment variables

Certain pieces of the configuration can be configured through environment variables.

| Variable           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `ETH_WEB3_URL`     | The url used to connect Web3 to the ethereum node.    |
| `ETH_WEB3_ADDRESS` | The default wallet address used to make transactions. |

## Smart Contracts

Predefined Smart Contracts can be added to the project in [this](https://github.com/legalthings/web3-server/tree/master/src/contracts) folder.
These contracts can then be instantiated and invoked by using the [API](https://github.com/legalthings/web3-server#api).

You can add a contract by first creating a folder with the name of the contract.
Within that folder add the following files.

```
| - my-contract
  | - contract.sol      | The smart contract written in Solidity
  | - contract.abi      | The smart contract application binary interface, used in JSON-RPC requests
  | - contract.bytecode | The smart contract compiled to bytecode, used to deploy it to the blockchain
```

## API

Api documentation can be found [here](http://docs.legalweb3server.apiary.io/).
