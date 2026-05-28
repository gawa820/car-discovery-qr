# 店舗向け：Googleフォーム + Google Drive画像アップロード運用

店舗スタッフは GitHub を触りません。Googleフォームだけで、車種情報と車画像を追加します。

## Googleフォームの質問項目

以下の質問名で作ってください。

| 質問名 | 種類 | 例 |
|---|---|---|
| carId | 記述式 | car04 |
| name | 記述式 | Civic |
| category | 記述式またはプルダウン | SPORT |
| shortDescription | 記述式 | 走りと日常性を両立したモデル |
| description | 段落 | Honda Civicは... |
| cardCatch | 記述式 | 毎日を少し楽しくする一台 |
| 画像アップロード | ファイルアップロード | civic.png |
| enabled | 記述式またはプルダウン | TRUE |

## 重要

画像をWebアプリで表示するには、Google Drive上の画像ファイルが「リンクを知っている全員が閲覧可」になっている必要があります。

画像が出ない場合は、まず画像ファイルの共有設定を確認してください。

## CSV公開URL

フォーム回答シートで：

1. ファイル
2. 共有
3. ウェブに公開
4. 形式を「カンマ区切り形式（.csv）」
5. 公開する
6. URLをコピー

GitHubの `config.js` に貼ります。

```js
window.CAR_DISCOVERY_CONFIG = {
  sheetCsvUrl: "ここにCSV公開URL"
};
```

## QRコード

`car04` のQRは：

```text
https://gawa820.github.io/car-discovery-qr/?car=car04
```
