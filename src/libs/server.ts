// modules
import * as express from 'express';
import * as config from 'config';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// libs
import { Eth } from './eth';
const url = 'https://launchlibrary.net/1.3/launch';
const trigger = 'Where are my trees?';
const token = process.env.TELEGRAM_TOKEN || '715239380:AAG6KnKR5JmOJfh9QwShtaFuof9px2XEEls';
const bot = new TelegramBot(token, {
  polling: true
});

const prepareData = (body: any) => {
  const launches = JSON.parse(body).launches;
  return launches.filter((launch: any) => launch !== undefined)
    .map((launch: any) => `${launch.name} on ${launch.net}`)
    .join('\n\n');
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

  startTelegram() {
    bot.on('message', (msg: any) => {
      if (msg.text && msg.text.toString() === trigger) {
        return request(url, (err: any, resp: any, body: any) => {
          bot.sendMessage(msg.chat.id, prepareData(body));
        });
      }
      if (msg.photo) {
        // console.log('msg :', msg);
        console.log('file_id :', msg.photo[0].file_id);
        const raw = msg.photo[0].file_id;
        const path = raw + '.jpg';
        const file_info = bot.get_file(raw);
        const downloaded_file = bot.download_file(file_info.file_path);
        console.log('downloaded_file :', downloaded_file);
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
