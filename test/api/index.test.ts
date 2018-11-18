// env vars
process.env.NODE_ENV = 'tests';
process.env.NODE_CONFIG_DIR = process.cwd() + '/src/config';

// imports
import { } from 'jest';
import * as request from 'supertest';
import * as config from 'config';
import { Server } from '../../src/libs/server';
import { app } from '../../src/libs/app';
import { Eth, EthConfig } from '../../src/libs/eth';

// tests
import DefaultTest from './default';
import EthTest from './eth';
import ContractTest from './contract';

// start server
const ethConfig: EthConfig = config.get('eth');
const server = new Server(config, app, new Eth(ethConfig));
server.start();

// run tests
const api = request(app);
new DefaultTest(api).run();
new EthTest(api).run();
new ContractTest(api).run();
