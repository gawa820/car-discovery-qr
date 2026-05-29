# 店舗向け：カード背景画像 + キャッチコピー・説明文だけ重ねる運用

## 方針

アプリ側では、カード画像の上に以下の2つだけを表示します。

- キャッチコピー
- 質問回答から生成される説明文

それ以外は、あらかじめカード画像に作り込んでください。

- 車種名
- Hondaロゴ
- 星
- SPORT / SPECIAL K-car などの分類
- 車写真
- カード枠
- 背景装飾

## Googleフォームの質問項目

| 質問名 | 種類 | 例 |
|---|---|---|
| carId | 記述式 | car04 |
| name | 記述式 | Civic |
| shortDescription | 記述式 | 走りと日常性を両立したモデル |
| description | 段落 | Honda Civicは... |
| cardCatch | 記述式 | 毎日を少し楽しくする一台 |
| 画像アップロード | ファイルアップロード | 文字以外が完成しているカード画像.png |
| enabled | 記述式またはプルダウン | TRUE |

## QRコード

QRコードはアプリ側で一覧表示できます。

```text
https://gawa820.github.io/car-discovery-qr/?qr=1
```

このURLを開くと、現在のスプレッドシート / cars.json に登録されている車両から、印刷用QR一覧が自動生成されます。

個別のQRコードに入るURLは、車両IDごとに以下の形です。

```text
https://gawa820.github.io/car-discovery-qr/?car=car04
```

スプレッドシート側でQR画像を表示したい場合は、以下の式も使えます。

```text
=IMAGE("https://quickchart.io/qr?text=" & ENCODEURL("https://gawa820.github.io/car-discovery-qr/?car=" & A2) & "&size=240")
```
