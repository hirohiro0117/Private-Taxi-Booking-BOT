const express = require("express");
const axios = require("axios");
const line = require("@line/bot-sdk");
require("dotenv").config();

const app = express();
app.use(express.json());

// LINE設定
const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

app.post("/webhook", async (req, res) => {
  try {
    const event = req.body.events?.[0];
    if (!event || !event.message?.text) return res.sendStatus(200);

    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // Difyへユーザーのメッセージを送信
    const difyResponse = await axios.post(
      "https://api.dify.ai/v1/chat-messages",
      {
        inputs: {},
        query: userMessage,
        user: "line_user"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const replyText = difyResponse.data.answer || "申し訳ありません、応答できませんでした。";

    // LINEへ返信
    await client.replyMessage(replyToken, {
      type: "text",
      text: replyText
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("エラー:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚕 タクシー予約BOTサーバー起動中：ポート${PORT}`);
});
