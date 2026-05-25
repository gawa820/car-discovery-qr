# 店舗スタッフ向け：車両追加ガイド

この版では、お客さん側の画面や体験フローは変えずに、Googleスプレッドシートを使って車両を追加できます。

## 店舗側で編集する項目

スプレッドシートには、次の列を作ってください。

| 列名 | 入れる内容 | 例 |
|---|---|---|
| 車両ID | QRコードに使うID。半角英数字がおすすめ | car04 |
| 車種名 | お客さんに表示される車名 | Honda Civic |
| タイプ | カード右上などに出す分類 | SPORT |
| 短い説明 | 詳細画面の短い説明 | 走りと日常の使いやすさを両立したモデル。 |
| 詳細説明 | 詳細画面に出す説明 | 展示車では外観や運転席を確認できます。 |
| 画像URL | 車の画像URL。公開されているURLにしてください | https://.../civic.png |
| レア度 | 星表示 | ★★★★★ |
| キャッチコピー | カード用の短いコピー | 毎日を少し楽しくする一台 |
| 表示 | TRUEなら表示、FALSEなら非表示 | TRUE |

`store-cars-template.csv` をGoogleスプレッドシートに読み込むと、列の見本として使えます。

## Googleスプレッドシートをアプリにつなぐ手順

1. Googleスプレッドシートを作る
2. `store-cars-template.csv` と同じ列名で車両データを入れる
3. メニューから `ファイル` → `共有` → `ウェブに公開` を選ぶ
4. 形式を `カンマ区切り値（.csv）` にする
5. 公開URLをコピーする
6. GitHubの `config.js` を開く
7. `sheetCsvUrl: ""` の `""` の中に公開CSV URLを貼る
8. Commit changes

例：

```js
window.CAR_DISCOVERY_CONFIG = {
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/xxxxxxxx/pub?output=csv"
};
```

## QRコードの作り方

車両IDが `car04` の場合、QRコードに入れるURLは次の形です。

```text
https://gawa820.github.io/car-discovery-qr/?car=car04
```

スプレッドシートにQR用URL列を追加する場合は、次のような式を使えます。

```text
="https://gawa820.github.io/car-discovery-qr/?car=" & A2
```

QR画像列を作る場合は、次の式を使えます。

```text
=IMAGE("https://quickchart.io/qr?text=" & ENCODEURL("https://gawa820.github.io/car-discovery-qr/?car=" & A2) & "&size=240")
```

## 注意

- 画像URLは、お客さんのスマホから見られる公開URLにしてください。
- Google Driveの共有リンクは、そのままだと画像として表示されない場合があります。
- 一番安全なのは、Web上で直接開ける `.png` / `.jpg` のURLです。
- 車両IDを変えると、印刷済みQRコードも作り直しになります。
