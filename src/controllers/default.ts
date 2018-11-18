'use strict';

import { Response, Request } from 'express';
import * as config from 'config';
import * as fs from 'fs';

class DefaultController {
  /**
   * GET /
   * Application info
   */
  info = (req: Request, res: Response) => {
    fs.readFile('package.json', { encoding: 'utf8' }, (err, data) => {
      if (err) {
        throw err;
      }

      const json = JSON.parse(data);

      res.json({
        name: json.name,
        version: json.version,
        description: json.description,
        env: config.get('env')
      });
    });
  }
}

const defaultController = new DefaultController();

export { DefaultController, defaultController };
