require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// 環境変数からNotion APIキーとデータベースIDを取得
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;

app.use(bodyParser.json());

// サインイン処理
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Notionデータベースをクエリ
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      }
    );

    // データベースからユーザー情報を検索
    const user = response.data.results.find((entry) => {
      const properties = entry.properties;
      const userEmail = properties.Email?.email || '';
      const userPassword = properties.Password?.rich_text[0]?.text?.content || '';
      return userEmail === email && userPassword === password;
    });

    if (user) {
      res.json({ success: true, message: 'ログイン成功！' });
    } else {
      res.json({ success: false, message: 'メールまたはパスワードが間違っています。' });
    }
  } catch (error) {
    console.error('Notion APIエラー:', error.message);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
  }
});

app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
