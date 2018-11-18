// env vars
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.env.NODE_CONFIG_DIR = process.cwd() + '/src/config';

// imports
import * as config from 'config';
import { Server } from './libs/server';
import { app } from './libs/app';
import { Eth, EthConfig } from './libs/eth';

// start server
(async () => {
  const ethConfig: EthConfig = config.get('eth');
  const server = new Server(config, app, new Eth(ethConfig));

  await server.start();
  server.startTelegram();

  console.log(('Eth node is running at http://localhost:8545'));
  console.log(('App is running at http://localhost:%d in %s mode'), config.get('port'), config.get('env'));
  console.log('Press CTRL-C to stop\n');
})();
