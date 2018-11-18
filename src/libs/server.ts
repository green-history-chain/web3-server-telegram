// modules
import * as express from 'express';
import * as config from 'config';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs');



// libs
import { Eth } from './eth';
//const url = 'https://launchlibrary.net/1.3/launch';
const url = 'http://localhost:3000/eth/contracts';
const trigger = 'Where are my trees?';
const token = process.env.TELEGRAM_TOKEN || '715239380:AAG6KnKR5JmOJfh9QwShtaFuof9px2XEEls';
const bot = new TelegramBot(token, {
  polling: true
});

const prepareData = (body: any) => {
  const launches = JSON.parse(body);
  console.log('body :', body);
  return JSON.stringify(launches);
/*   return launches.filter((launch: any) => launch !== undefined)
    .map((launch: any) => `${launch.name} on ${launch.net}`)
    .join('\n\n'); */
};
class Server {
  config: config.IConfig;
  app: express.Express;
  eth: Eth;

  constructor(config: config.IConfig, app: express.Express, eth: Eth) {
    this.config = config;
    this.app = app;
    this.eth = eth;
  }

  download (url: any, dest: any, cb: any) {
    const file = fs.createWriteStream(dest);
    const requestFile = request(url, (err: any, resp: any, response: any) => {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
      });
    }).on('error', function(err: any) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
  }

  startTelegram() {
    bot.on('message', async (msg: any) => {
      if (msg.text && msg.text.toString() === trigger) {
        return request(url, (err: any, resp: any, body: any) => {
          bot.sendMessage(msg.chat.id, prepareData(body));
        });
      }
      if (msg.photo) {
        // console.log('msg :', msg);
        console.log('file_id :', msg.photo[0].file_id);
        const raw = msg.photo[0].file_id;
        const photoUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${raw}`;
        console.log('photo.result.file_path :', photoUrl);
        await request(photoUrl).pipe(fs.createWriteStream('doodle.jpg'));
        await bot.sendMessage(msg.chat.id, 'prepareData(raw)');
        // });
       return this.download(photoUrl, 'file.jpg', (body: any) => {

        });
      }
      bot.sendMessage(msg.chat.id, 'I can save hash of photo in WIZBL!', {
        reply_markup: {
          keyboard: [[trigger], ['What can I do']]
        }
      }
      );
    });
    bot.onText(/\/echo (.+)/, (msg: any, match: any) => {
      // 'msg' is the received Message from Telegram
      // 'match' is the result of executing the regexp above on the text content
      // of the message
      const chatId = msg.chat.id;
      const resp = match[1]; // the captured "whatever"
      // send back the matched "whatever" to the chat
      bot.sendMessage(chatId, resp);
    });
  }

  start(): Promise<any> {
    return new Promise(async (resolve: any, reject: any) => {
      await this.eth.startNode();
      this.app.listen(config.get('port'), () => resolve());
    });
  }
}

export { Server };
