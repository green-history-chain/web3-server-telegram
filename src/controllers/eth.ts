'use strict';

import { Response, Request } from 'express';
import * as config from 'config';
import { Eth, EthConfig } from '../libs/eth';

class EthController {
  public settings: EthConfig;

  constructor (settings?: EthConfig) {
    this.settings = settings || config.get('eth') as EthConfig;
  }

  /**
   * GET /eth
   * Ethereum node info
   */
  info = async (req: Request, res: Response) => {
    const eth = await Eth.create(this.settings);

    res.json({
      version: eth.getApiVersion(),
      node: await eth.getNodeVersion(),
      network: await eth.getNetworkVersion(),
      default_account: {
        address: eth.getDefaultAccount(),
        balance: await eth.getBalance(eth.getDefaultAccount())
      },
      accounts: await eth.getAccounts(),
      syncing: await eth.getSyncing()
    });
  }
}

const ethController = new EthController();

export { EthController, ethController };
