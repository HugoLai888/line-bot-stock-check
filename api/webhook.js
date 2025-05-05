const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const { getStockByKeyword } = require('../lib/googleSheets');

const app = express();
app.use(express.json());

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// webhook endpoint
app.post('/', middleware(config), async (req, res) => {
  // LINE 的驗證事件會在這邊出現，必須快速回應
  if (!req.body.events || req.body.events.length === 0) {
    return res.status(200).send('OK');
  }

  const events = req.body.events;

  const results = await Promise.all(events.map(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text;

      if (text.startsWith('查詢') && text.endsWith('庫存')) {
        const keyword = text.replace(/^查詢|\s*庫存$/g, '').trim();
        const reply = await getStockByKeyword(keyword);
        return client.replyMessage(event.replyToken, { type: 'text', text: reply });
      }
    }
  }));

  res.status(200).end();
});

module.exports = app;
