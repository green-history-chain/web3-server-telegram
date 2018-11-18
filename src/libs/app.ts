// modules
import * as express from 'express';
import * as compression from 'compression';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as errorHandler from 'errorhandler';
import * as expressValidator from 'express-validator';

// controllers
import { defaultController } from '../controllers/default';
import { ethController } from '../controllers/eth';
import { contractController } from '../controllers/contract';

// express
const app = express();
app.use(compression());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

// routes
app.get('/', defaultController.info);
app.get('/eth', ethController.info);
app.get('/eth/contracts', contractController.list);
app.get('/eth/contracts/:id', contractController.get);
app.post('/eth/contracts/:id', contractController.invoke);

// error handler
app.use(errorHandler());

export { app };
