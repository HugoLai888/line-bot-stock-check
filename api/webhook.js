// /api/webhook.js
const express = require("express");
const line = require("@line/bot-sdk");
const { searchStock } = require("../lib/googleSheets");

const router = express.Router();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

router.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const msg = event.message.text;

      // 只處理「查詢 xxx 庫存」格式
      const match = msg.match(/^查詢\s*(.+)\s*庫存$/);
      if (match) {
        const keyword = match[1];
        try {
          const result = await searchStock(keyword);
          const reply = result.length
            ? result.map(r =>
                `品名代號：${r.code}\n品名名稱：${r.name}\n庫存量：${r.stock}`
              ).join("\n\n")
            : `找不到「${keyword}」的庫存資訊`;

          await client.replyMessage(event.replyToken, { type: "text", text: reply });
        } catch (err) {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "查詢時發生錯誤，請稍後再試。",
          });
        }
      }
    }
  }

  res.status(200).send("OK");
});

module.exports = router;
