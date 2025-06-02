# Discord-embed-generator

## 概要

Discord-embed-generatorは、DiscordのWebhookなどで利用可能な「Embed」メッセージをWeb上で簡単に作成・プレビュー・出力できるツールです。  
GUIで各種パラメータを入力し、即座にプレビュー&JSON出力が可能です。

---

## 特徴

- DiscordのEmbedメッセージをGUIで編集
- プレビュー表示（実際の見た目を再現）
- JSON形式で出力・コピー
- インストール不要、HTML/CSS/JavaScriptファイルのみで動作
- 日本語対応

---

## 使い方

1. `embed.html`, `embed.css`, `embed.js` を同じディレクトリに配置します。
2. `embed.html` をWebブラウザで開きます。
3. 各種フォームに情報を入力（タイトル、説明、色、画像、フィールドなど）。
4. 右側にリアルタイムでプレビューが表示されます。
5. 下部の「Embed JSON」からJSON形式をコピーできます。
6. 作成したJSONをDiscordのWebhookやBotなどに貼り付けて利用してください。

---

## ファイル構成

- `embed.html` : ツール本体のHTML
- `embed.css`  : スタイルシート
- `embed.js`   : 機能・ロジック

---

## ライセンス

このソフトウェアはパブリックドメイン（[The Unlicense](https://unlicense.org/)）として公開されています。  
誰でも自由にコピー、改変、商用・非商用問わず利用、再配布が可能です。  
詳細は[LICENSE](./LICENSE)をご参照ください。

---

## 作者

[CureSaba](https://github.com/CureSaba)
