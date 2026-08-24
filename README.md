# Multi-AI Prompt Tool

複数の生成AIチャットに同じプロンプトを入力して、結果を比較するWebアプリケーションです。

## 対応AI

- 🤖 GitHub Copilot
- 💬 Google Gemini
- 🧠 Anthropic Claude
- 🔗 ChatGPT (OpenAI)

## 機能

- **統一プロンプト入力**: 1つのフォームから複数のAIに同時にプロンプトを送信
- **比較表示**: 複数のAIからの回答を並べて比較
- **API統合**: 各AIサービスの公式APIを使用
- **快適なUI**: React + TypeScriptによるモダンなインターフェース

## 必要な準備

各AIサービスのAPIキーを取得してください：

1. **OpenAI (ChatGPT)**
   - https://platform.openai.com/api-keys

2. **Google Gemini**
   - https://makersuite.google.com/app/apikey

3. **Anthropic (Claude)**
   - https://console.anthropic.com/account/keys

4. **GitHub Copilot**
   - GitHub認証トークンが必要

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/daydreammodel3/multi-ai-prompt-tool.git
cd multi-ai-prompt-tool
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

`.env` に各APIキーを設定：

```
OPENAI_API_KEY=your_openai_key
GOOGLE_GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
GITHUB_TOKEN=your_github_token
PORT=3001
```

## プロジェクト構成

```
multi-ai-prompt-tool/
├── server/                 # バックエンド (Node.js + Express)
│   ├── index.js
│   ├── routes/            # APIエンドポイント
│   │   └── prompts.js
│   ├── services/          # AI API統合
│   │   ├── openai.js
│   │   ├── gemini.js
│   │   ├── claude.js
│   │   └── github-copilot.js
├── client/                # フロントエンド (React + TypeScript)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── README.md
```

## 使い方

1. **プロンプト入力**: テキストエリアにプロンプトを入力
2. **AI選択**: 比較したいAIをチェック
3. **送信**: 「送信」ボタンをクリック
4. **比較**: 各AIの回答を横並びで確認

## Docker で起動する

### 1. 環境変数ファイルを作成

```bash
cp .env.example .env
# .env に各APIキーを記入
```

### 2. ビルドと起動

```bash
docker compose up -d --build
```

- アプリ: http://localhost:3001
- フロントエンドとAPIサーバーを 1 コンテナで配信
- ホストの `.env` が存在しない場合も起動可（APIキー未設定でサービスが `Unavailable` 表示）

### 3. 停止

```bash
docker compose down
```

### 4. ログ確認

```bash
docker compose logs -f
```

## ローカル開発サーバーで起動する

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3001

## 本番配信（Docker 不使用）

```bash
npm run build
npm start
```

`npm start` は `client/dist` があれば、フロントエンドもまとめて配信します。

## ライセンス

MIT License

## 貢献

プルリクエスト、イシュー報告を歓迎します！

## 注意事項

- 各AIサービスのAPIキーは秘密に保ってください
- API使用料金が発生する場合があります
- 利用規約に従ってください
