let cars = [];
let currentCar = null;
let discoveredIds = new Set();
let personalCards = [];

const DISCOVERY_STORAGE_KEY = "carDiscoveryDiscoveredIds_v4";
const CARD_STORAGE_KEY = "carDiscoveryMiniCatalogs_v2";

let currentQuestionIndex = 0;
let currentAnswers = [];
let selectedAnswer = null;

// ================================
// 店舗側の車両追加設定
// ================================
// Googleスプレッドシートを「ウェブに公開」したCSV URLを config.js に設定すると、
// cars.json の代わりにスプレッドシートの車両データを読み込みます。
// 未設定のときは、これまで通り cars.json を読み込みます。
const CAR_DATA_CSV_URL =
  (window.CAR_DISCOVERY_CONFIG && window.CAR_DISCOVERY_CONFIG.sheetCsvUrl) || "";


const questionFlows = {
  car01: [
    {
      id: "prelude_first",
      question: "まず外から見て、どこが気になりましたか？",
      choices: [
        {
          label: "低く流れるようなシルエット",
          tag: "シルエット",
          title: "外観の見どころ",
          text: "少し離れて横から見てみると、Preludeらしい低く伸びやかなラインがわかりやすくなります。移動手段というより、乗る前から気分を変えてくれる一台として見ると魅力が伝わりやすいです。",
          catalogPhrase: "低く流れるようなシルエットが印象的で"
        },
        {
          label: "スポーツカーらしい雰囲気",
          tag: "スポーツ感",
          title: "スポーツ感の見どころ",
          text: "走らせることはできなくても、車高の低さ、タイヤの存在感、運転席の包まれ感を見ると、スポーツカーらしい高揚感を感じやすくなります。",
          catalogPhrase: "スポーツカーらしい高揚感を感じさせ"
        },
        {
          label: "大人っぽい特別感",
          tag: "特別感",
          title: "特別感の見どころ",
          text: "Preludeは派手さだけで見せる車ではなく、落ち着いた特別感を楽しむ車として見ると魅力が見えてきます。ドアを開けたときの雰囲気や内装の質感にも注目してみてください。",
          catalogPhrase: "大人っぽい特別感をまとった"
        }
      ]
    },
    {
      id: "prelude_inside",
      question: "乗り込んで確認するなら、どこを見たいですか？",
      choices: [
        {
          label: "運転席からの景色",
          tag: "運転席",
          title: "運転席からの景色",
          text: "運転席に座れるなら、目線の低さや前方の見え方を感じてみてください。走らせなくても、この車で走る自分を想像できるかが大切なポイントです。",
          catalogPhrase: "運転席に座ったときの特別な景色も魅力です"
        },
        {
          label: "ハンドルまわりの雰囲気",
          tag: "コックピット",
          title: "コックピットの見どころ",
          text: "ハンドル、メーター、スイッチまわりを見ると、Preludeがどんな気分で運転してほしい車なのかが伝わります。日常車とは少し違う、ドライバー中心の雰囲気を感じてみてください。",
          catalogPhrase: "ドライバー中心のコックピット感が楽しめます"
        },
        {
          label: "後席やトランクの使い勝手",
          tag: "実用性",
          title: "実用性の見どころ",
          text: "美しいクーペでも、後席やトランクを見ると現実的な使い方が想像しやすくなります。趣味性と普段使いのバランスを見るなら、ここはぜひ確認したいポイントです。",
          catalogPhrase: "後席やトランクまで見ると現実的な使い方も想像しやすい"
        }
      ]
    },
    {
      id: "prelude_consider",
      question: "購入を考えるとしたら、何が気になりますか？",
      choices: [
        {
          label: "普段使いできるか",
          tag: "普段使い",
          title: "普段使いの見方",
          text: "普段使いが気になるなら、乗り降り、視界、荷物の置きやすさを見てみましょう。Preludeは趣味性のある車なので、毎日の移動と楽しさのバランスで見るのがおすすめです。",
          catalogPhrase: "日常でも扱える現実感を持ちながら"
        },
        {
          label: "価格に見合う特別感があるか",
          tag: "所有満足",
          title: "価格と満足感の見方",
          text: "価格はグレードや条件で変わりますが、Preludeを見るときは移動手段としてだけでなく、所有する満足感や運転する時間の楽しさまで含めて考えると判断しやすくなります。",
          catalogPhrase: "所有する満足感まで含めて価値を感じやすい"
        },
        {
          label: "自分に似合うか",
          tag: "相性",
          title: "自分に合うかの見方",
          text: "自分に似合うかは、スペックだけでは決まりません。実車の前に立って、乗って出かける自分を想像したときに気分が上がるかを見てみてください。",
          catalogPhrase: "乗る人の気分まで変えてくれるような存在感があります"
        }
      ]
    },
    {
      id: "prelude_final",
      question: "最後に実車で見ておきたいところは？",
      choices: [
        {
          label: "横から見たボディライン",
          tag: "ボディライン",
          title: "ボディラインの確認",
          text: "Preludeの魅力は、近くで見るだけでなく少し離れて見ると伝わりやすいです。横からのラインを見ると、この車の伸びやかさや特別感がよりわかります。",
          catalogPhrase: "横から見たボディラインにも魅力が表れます"
        },
        {
          label: "運転席の低さ",
          tag: "低い目線",
          title: "低い目線の確認",
          text: "運転席に座ったときの低い目線は、スポーツカーらしさを感じやすいポイントです。走らせられなくても、座っただけで車のキャラクターが伝わります。",
          catalogPhrase: "低い目線がスポーツカーらしい感覚を引き立てます"
        },
        {
          label: "トランクや後席",
          tag: "使い勝手",
          title: "使い勝手の確認",
          text: "トランクや後席を見ると、趣味の車としてだけでなく、実際にどれくらい使えるかが見えてきます。現実的に検討するなら大切なポイントです。",
          catalogPhrase: "使い勝手も確認することで検討しやすい一台です"
        }
      ]
    }
  ],

  car02: [
    {
      id: "nbox_first",
      question: "まず見て、どこが気になりましたか？",
      choices: [
        {
          label: "室内が広そうなところ",
          tag: "室内空間",
          title: "室内の広さ",
          text: "N-BOXは、外から見たサイズ感と中に入ったときのゆとりの差が大きな見どころです。運転席だけでなく、後席にも座って広さを感じてみてください。",
          catalogPhrase: "外から見る以上にゆとりある室内空間が魅力で"
        },
        {
          label: "家族や友人と使いやすそうなところ",
          tag: "家族利用",
          title: "みんなで使う見どころ",
          text: "家族や友人と使うなら、後席への乗り降り、足元の広さ、ドアの開き方を見てみるのがおすすめです。日常で人を乗せる場面が想像しやすくなります。",
          catalogPhrase: "家族や友人との移動にも使いやすく"
        },
        {
          label: "毎日運転しやすそうなところ",
          tag: "運転しやすさ",
          title: "運転しやすさの見どころ",
          text: "毎日使う車として見るなら、運転席からの見晴らしや車の角のわかりやすさが大事です。座ってみると、日常で扱いやすいかがイメージしやすくなります。",
          catalogPhrase: "毎日の運転で扱いやすさを感じやすい"
        }
      ]
    },
    {
      id: "nbox_inside",
      question: "乗り込んで確認するなら、どこを見たいですか？",
      choices: [
        {
          label: "後席の広さ",
          tag: "後席",
          title: "後席の見どころ",
          text: "後席は足元のゆとりだけでなく、乗り降りのしやすさも見てみてください。家族や友人を乗せることが多い人には、とても大切な確認ポイントです。",
          catalogPhrase: "後席のゆとりが日常の使いやすさにつながります"
        },
        {
          label: "スライドドアまわり",
          tag: "スライドドア",
          title: "スライドドアの見どころ",
          text: "スライドドアは、狭い駐車場や荷物が多いときに便利さを感じやすい部分です。ドアの開口部や乗り込みやすさを実際に見てみましょう。",
          catalogPhrase: "スライドドアによる乗り降りのしやすさも魅力です"
        },
        {
          label: "収納や小物置き",
          tag: "収納",
          title: "収納の見どころ",
          text: "毎日使う車は、小さな収納が意外と大切です。スマホ、飲み物、バッグなど、普段の持ち物をどこに置けそうか想像してみてください。",
          catalogPhrase: "小物を置きやすい収納まわりも日常で便利です"
        }
      ]
    },
    {
      id: "nbox_life",
      question: "普段使いで気になることは？",
      choices: [
        {
          label: "買い物の荷物が積めるか",
          tag: "荷室",
          title: "荷室の見どころ",
          text: "買い物や日常使いを考えるなら、荷室を開けて普段の荷物を置く場面を想像してみましょう。毎日の小さな使いやすさが見えてきます。",
          catalogPhrase: "買い物や日常の荷物にも対応しやすく"
        },
        {
          label: "子どもや家族が乗りやすいか",
          tag: "乗り降り",
          title: "家族目線の見どころ",
          text: "子どもや家族が乗るなら、後席へのアクセス、ドアの開き方、足元の広さを見てみてください。自分以外の人が快適に使えるかも大切です。",
          catalogPhrase: "家族が乗り降りしやすい設計がうれしい"
        },
        {
          label: "軽自動車で十分か",
          tag: "十分感",
          title: "軽自動車としての十分感",
          text: "軽自動車で十分かを見るには、広さ、荷室、運転席の見晴らしを実際に確認するのが一番です。N-BOXはサイズ以上の使い勝手を感じやすい車です。",
          catalogPhrase: "軽自動車の枠を感じさせにくい使い勝手があります"
        }
      ]
    },
    {
      id: "nbox_final",
      question: "最後に実車で見ておきたいところは？",
      choices: [
        {
          label: "荷室とシートアレンジ",
          tag: "荷室アレンジ",
          title: "荷室とシートの確認",
          text: "荷室とシートの使い方を見ると、買い物、送り迎え、旅行などの場面を想像しやすくなります。日常に合うかを見るなら重要なポイントです。",
          catalogPhrase: "荷室とシートアレンジで暮らしに合わせやすい"
        },
        {
          label: "運転席の見晴らし",
          tag: "見晴らし",
          title: "見晴らしの確認",
          text: "運転席からの見晴らしは、毎日の安心感につながります。座ったときに前方や周囲が見やすいかを確認してみてください。",
          catalogPhrase: "運転席からの見晴らしが安心感を支えます"
        },
        {
          label: "乗り降りのしやすさ",
          tag: "アクセス",
          title: "乗り降りの確認",
          text: "車は乗るたびにドアを開けて乗り込みます。乗り降りがしやすいかは、日常で長く使うほど大切になるポイントです。",
          catalogPhrase: "乗り降りのしやすさが毎日の使いやすさにつながります"
        }
      ]
    }
  ],

  car03: [
    {
      id: "superone_first",
      question: "まず見て、どこが気になりましたか？",
      choices: [
        {
          label: "小さいのに迫力ある見た目",
          tag: "迫力",
          title: "見た目の見どころ",
          text: "Super-ONEは小型EVでありながら、見た目に強いキャラクターがあります。サイズの小ささだけでなく、EV Sportらしい存在感を見てみてください。",
          catalogPhrase: "小さなボディに迫力あるキャラクターを持ち"
        },
        {
          label: "EVなのに楽しそうな雰囲気",
          tag: "EVの楽しさ",
          title: "EVらしさの見どころ",
          text: "Super-ONEは、ただ静かに移動するEVというより、走る気分を盛り上げる小型EVとして見ると面白い車です。外観や内装から、その遊び心を感じてみてください。",
          catalogPhrase: "EVらしい新しさと走る楽しさを両立し"
        },
        {
          label: "BOOSTモードという言葉",
          tag: "BOOSTモード",
          title: "BOOSTモードの見どころ",
          text: "BOOSTモードが気になったなら、Super-ONEは走りの高揚感を大切にした小型EVとして見ると魅力が伝わります。走らせられなくても、運転席まわりからその世界観を想像できます。",
          catalogPhrase: "BOOSTモードに象徴される遊び心が魅力で"
        }
      ]
    },
    {
      id: "superone_inside",
      question: "乗り込んで確認するなら、どこを見たいですか？",
      choices: [
        {
          label: "運転席のワクワク感",
          tag: "運転席",
          title: "運転席の見どころ",
          text: "運転席に座れるなら、車の小ささだけでなく、囲まれ感や操作まわりの雰囲気を見てみてください。日常の移動に遊び心を足す車として見えてきます。",
          catalogPhrase: "運転席に座ったときのワクワク感も楽しめます"
        },
        {
          label: "小型EVらしいサイズ感",
          tag: "サイズ感",
          title: "サイズ感の見どころ",
          text: "街中で使うなら、サイズ感は大きな魅力です。外から見たコンパクトさと、乗り込んだときの空間の感じ方を比べてみてください。",
          catalogPhrase: "街中で扱いやすいサイズ感も魅力です"
        },
        {
          label: "操作まわりの未来感",
          tag: "未来感",
          title: "未来感の見どころ",
          text: "EVとしての新しさは、外観だけでなく操作まわりにも表れます。スイッチ、表示、運転席の雰囲気から、新しい移動体験を想像してみてください。",
          catalogPhrase: "操作まわりには小型EVらしい未来感があります"
        }
      ]
    },
    {
      id: "superone_life",
      question: "購入を考えるとしたら、気になることは？",
      choices: [
        {
          label: "EVとして普段使いできるか",
          tag: "EV日常",
          title: "EVとしての普段使い",
          text: "EVとして普段使いできるかは、自分の移動距離や使い方を思い浮かべると考えやすくなります。近距離移動が中心なら、小型EVは相性が良い可能性があります。",
          catalogPhrase: "日常の移動にも取り入れやすい小型EVとして"
        },
        {
          label: "小さくても楽しいか",
          tag: "走る楽しさ",
          title: "小さくても楽しいか",
          text: "小さな車でも、軽快さや反応の良さがあると運転は楽しくなります。Super-ONEは、サイズの小ささと走る楽しさを両立する方向で見ると魅力が見えてきます。",
          catalogPhrase: "小さくても走る楽しさを感じさせる"
        },
        {
          label: "自分の生活に合うか",
          tag: "生活との相性",
          title: "生活との相性",
          text: "自分の生活に合うかを見るなら、普段の移動距離、駐車環境、乗せる人数を想像してみましょう。小型EVは使い方が合うと、とても気軽な一台になります。",
          catalogPhrase: "暮らしに合えば気軽に楽しめる一台です"
        }
      ]
    },
    {
      id: "superone_final",
      question: "最後に実車で見ておきたいところは？",
      choices: [
        {
          label: "BOOSTモードの世界観",
          tag: "BOOST世界観",
          title: "BOOSTの世界観",
          text: "BOOSTモードは、Super-ONEのキャラクターを象徴する要素です。実際に走らせられなくても、車全体のデザインや運転席から、その高揚感を想像してみてください。",
          catalogPhrase: "BOOSTモードの世界観が車全体の個性を引き立てます"
        },
        {
          label: "運転席まわり",
          tag: "コックピット",
          title: "運転席まわりの確認",
          text: "運転席まわりを見ると、Super-ONEがどんな気分で乗ってほしい車なのかが見えてきます。新しいEV体験を想像しながら見てみてください。",
          catalogPhrase: "運転席まわりから新しいEV体験を感じられます"
        },
        {
          label: "小型EVとしてのサイズ感",
          tag: "小型EV",
          title: "小型EVのサイズ感",
          text: "サイズ感は小型EVの大きな魅力です。街中や近場の移動で使う自分を想像すると、Super-ONEの良さが見えやすくなります。",
          catalogPhrase: "小型EVらしいサイズ感が日常での扱いやすさにつながります"
        }
      ]
    }
  ]
};

const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const qrReader = document.getElementById("qr-reader");
let qrScanner = null;
let isQrRunning = false;
let lastScannedValue = "";
let lastScanAt = 0;

const guideCard = document.getElementById("guide-card");
const discoveryCard = document.getElementById("discovery-card");
const detailCard = document.getElementById("detail-card");
const questionPanel = document.getElementById("question-panel");
const cardsScreen = document.getElementById("cards-screen");
const cardModal = document.getElementById("card-modal");
const errorMessage = document.getElementById("error-message");

const discoveryCarName = document.getElementById("discovery-car-name");
const detailCarName = document.getElementById("detail-car-name");
const detailShort = document.getElementById("detail-short");
const detailDescription = document.getElementById("detail-description");

const showDetailButton = document.getElementById("show-detail-button");
const continueScanButton = document.getElementById("continue-scan-button");
const closeDetailButton = document.getElementById("close-detail-button");
const backToScanButton = document.getElementById("back-to-scan-button");
const makeCardButton = document.getElementById("make-card-button");

const closeQuestionButton = document.getElementById("close-question-button");
const questionProgress = document.getElementById("question-progress");
const questionText = document.getElementById("question-text");
const choiceOptions = document.getElementById("choice-options");
const answerBox = document.getElementById("answer-box");
const answerTitle = document.getElementById("answer-title");
const answerText = document.getElementById("answer-text");
const nextQuestionButton = document.getElementById("next-question-button");
const finishQuestionsButton = document.getElementById("finish-questions-button");

const openCardsButton = document.getElementById("open-cards-button");
const closeCardsButton = document.getElementById("close-cards-button");
const resetButton = document.getElementById("reset-button");

const progress = document.getElementById("progress");
const collectionRow = document.getElementById("collection-row");
const cardCarousel = document.getElementById("card-carousel");
const modalCardContent = document.getElementById("modal-card-content");
const closeModalButton = document.getElementById("close-modal-button");
const modalBackdrop = document.getElementById("modal-backdrop");

main();

async function main() {
  loadCollection();
  loadPersonalCards();

  try {
    cars = await loadCars();
  } catch (error) {
    console.error(error);
    showError("車データを読み込めませんでした。cars.json を確認してください。");
    return;
  }

  renderCollection();
  setupButtons();
  checkInitialCarFromUrl();
}

async function loadCars() {
  const params = new URLSearchParams(window.location.search);
  const sheetFromUrl = params.get("sheet");
  const csvUrl = sheetFromUrl || CAR_DATA_CSV_URL;

  // 店舗運用時: Googleスプレッドシート公開CSVから読み込み
  if (csvUrl) {
    const sheetCars = await loadCarsFromCsv(csvUrl);
    if (sheetCars.length > 0) {
      return sheetCars;
    }

    console.warn("スプレッドシートに有効な車両データがありません。cars.json に戻します。");
  }

  // 開発・保険用: これまで通りローカルJSONから読み込み
  const response = await fetch("./cars.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("cars.json の読み込みに失敗しました");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("cars.json は配列である必要があります");
  }

  return data.map(normalizeCarData).filter(Boolean);
}

async function loadCarsFromCsv(csvUrl) {
  const cacheBust = csvUrl.includes("?") ? `&t=${Date.now()}` : `?t=${Date.now()}`;
  const response = await fetch(csvUrl + cacheBust, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("スプレッドシートの車両データを読み込めませんでした");
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);

  if (rows.length <= 1) {
    return [];
  }

  const headers = rows[0].map((header) => String(header || "").trim());
  const bodyRows = rows.slice(1);

  return bodyRows
    .map((cells, index) => {
      const row = {};
      headers.forEach((header, cellIndex) => {
        row[header] = cells[cellIndex] || "";
      });
      return normalizeCarData(row, index);
    })
    .filter(Boolean);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);

  return rows.filter((items) => items.some((item) => String(item || "").trim() !== ""));
}


function firstUrlLikeValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const match = text.match(/https?:\/\/[^\s,]+/);
  if (match) return match[0].trim();

  return text.split(/[\n,]/)[0].trim();
}

function extractGoogleDriveFileId(value) {
  const raw = firstUrlLikeValue(value);
  if (!raw) return "";

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/uc\?[^#]*id=([a-zA-Z0-9_-]+)/,
    /\/thumbnail\?[^#]*id=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) {
    return raw;
  }

  return "";
}

function normalizeImageUrl(value) {
  const raw = firstUrlLikeValue(value);
  if (!raw) return "";

  const driveId = extractGoogleDriveFileId(raw);
  if (driveId) {
    // Smartphone-friendly Drive image URL.
    return `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
  }

  return raw;
}


function normalizeCarData(raw, index = 0) {
  const get = (...keys) => {
    for (const key of keys) {
      const value = raw[key];
      if (value !== undefined && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  };

  const visible = get("表示", "公開", "有効", "enabled", "visible", "公開する");
  if (visible && /^(false|0|no|off|非表示|表示しない|しない)$/i.test(visible)) {
    return null;
  }

  const id = get("carId", "id", "ID", "車両ID", "車ID") || `car${String(index + 1).padStart(2, "0")}`;
  const name = get("name", "車種名", "車名", "モデル名");
  const carImageRaw = get("carImage", "imageUrl", "画像URL", "車画像URL", "車の画像URL", "車の絵URL", "画像アップロード", "車画像アップロード", "imageFile", "fileUpload");
  const carImage = normalizeImageUrl(carImageRaw);
  const cardImage = get("cardImage", "カード画像URL", "カード台紙込み画像URL");

  if (!name) {
    return null;
  }

  return {
    id,
    name,
    rarity: get("rarity", "レア度") || "★★★★★",
    type: get("category", "type", "タイプ", "カテゴリ", "カテゴリー") || "SPECIAL",
    cardColor: get("cardColor", "カード色") || "auto",
    // cardImage は「台紙」または「完成済みカード」。
    // carImage は「車の写真」。店舗追加車両では cardImage に車写真を入れない。
    cardImage: cardImage || (carImage ? "./assets/card-template.png" : "./assets/prelude-card.png"),
    carImage: carImage || "",
    short: get("shortDescription", "short", "短い説明", "ひとこと説明") || `${name}の展示車です。`,
    description:
      get("description", "詳細説明", "説明", "見どころ") ||
      `${name}の外観、運転席、後席、荷室などを実際に見ながら、気になるポイントを確認できます。`,
    cardCatch: get("cardCatch", "キャッチコピー") || "あなただけのミニカタログ"
  };
}

function setupButtons() {
  startButton.addEventListener("click", async () => {
    hideError();
    startScreen.classList.add("hidden");

    try {
      await startQrScanner();
    } catch (error) {
      console.error(error);
      startScreen.classList.remove("hidden");
      showError(
        "カメラを開始できませんでした。カメラ許可、HTTPS、QRライブラリの読み込みを確認してください。"
      );
    }
  });

    showDetailButton.addEventListener("click", () => {
    if (!currentCar) return;
    openQuestionPanel(currentCar);
  });

  continueScanButton.addEventListener("click", () => {
    currentCar = null;
    showGuide();
  });

  closeDetailButton.addEventListener("click", () => {
    currentCar = null;
    showGuide();
  });

  backToScanButton.addEventListener("click", () => {
    currentCar = null;
    showGuide();
  });

  makeCardButton.addEventListener("click", () => {
    if (!currentCar) return;
    openQuestionPanel(currentCar);
  });

  closeQuestionButton.addEventListener("click", () => {
    questionPanel.classList.add("hidden");
  });

  nextQuestionButton.addEventListener("click", () => {
    goToNextQuestion();
  });

  finishQuestionsButton.addEventListener("click", () => {
    finishQuestionsAndCreateCatalog();
  });

  openCardsButton.addEventListener("click", () => {
    loadPersonalCards();
    renderCardCarousel();
    cardsScreen.classList.remove("hidden");
  });

  closeCardsButton.addEventListener("click", () => {
    cardsScreen.classList.add("hidden");
  });

  closeModalButton.addEventListener("click", closeCardModal);
  modalBackdrop.addEventListener("click", closeCardModal);

  resetButton.addEventListener("click", () => {
    const ok = window.confirm("コレクションとミニカタログをリセットしますか？");
    if (!ok) return;

    discoveredIds = new Set();
    personalCards = [];
    currentCar = null;

    saveCollection();
    savePersonalCards();
    renderCollection();
    showGuide();
  });
}

async function startQrScanner() {
  if (isQrRunning) return;

  if (!window.Html5Qrcode) {
    throw new Error("QR scanner library が読み込まれていません");
  }

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader", false);
  }

  const config = {
    fps: 10,
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
      return { width: size, height: size };
    },
    aspectRatio: window.innerWidth / window.innerHeight,
    disableFlip: false
  };

  await qrScanner.start(
    { facingMode: "environment" },
    config,
    handleQrSuccess,
    () => {}
  );

  isQrRunning = true;
}

function handleQrSuccess(decodedText) {
  const now = Date.now();
  const value = String(decodedText || "").trim();

  if (!value) return;

  // 同じQRを読み続けたときに、画面が何度も開くのを防ぐ
  if (value === lastScannedValue && now - lastScanAt < 1800) {
    return;
  }

  lastScannedValue = value;
  lastScanAt = now;

  const carId = extractCarIdFromQr(value);

  if (!carId) {
    showError("このQRコードは車両データとして読み取れませんでした。");
    return;
  }

  const car = cars.find((item) => String(item.id || "").trim().toLowerCase() === String(carId || "").trim().toLowerCase());

  if (!car) {
    showError(`車両ID「${carId}」が cars.json に見つかりません。`);
    return;
  }

  hideError();
  discoverCar(car);
}

function extractCarIdFromQr(value) {
  const raw = String(value || "").trim();

  // QRには car01 のようなIDだけを入れてもOK
  if (cars.some((car) => car.id === raw)) {
    return raw;
  }

  // URL形式: https://example.com/?car=car01
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("car") || url.searchParams.get("id");
    if (fromQuery) return fromQuery.trim();

    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const fromHash = hashParams.get("car") || hashParams.get("id");
    if (fromHash) return fromHash.trim();

    const lastPath = url.pathname.split("/").filter(Boolean).pop();
    if (lastPath && cars.some((car) => car.id === lastPath)) {
      return lastPath;
    }
  } catch (error) {
    // URLでない文字列は下の簡易パースへ
  }

  // car=car01 のような短い文字列にも対応
  const match = raw.match(/(?:car|id)=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return null;
}

function checkInitialCarFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestedCarId = (params.get("car") || params.get("id") || "").trim();
  if (!requestedCarId) return;

  const car = cars.find(
    (item) => String(item.id || "").trim().toLowerCase() === requestedCarId.toLowerCase()
  );

  if (!car) {
    showError(`車両ID「${requestedCarId}」が見つかりません。スプレッドシートの carId を確認してください。`);
    return;
  }

  // 外部のカメラアプリでQRを読んで ?car=car04 のURLから開いた場合も、
  // チェックを付けるだけでなく、通常のQR読み取り時と同じ発見画面を表示する。
  hideError();
  discoverCar(car);
}

function discoverCar(car) {
  currentCar = car;

  if (!discoveredIds.has(car.id)) {
    discoveredIds.add(car.id);
    saveCollection();
  }

  renderCollection();
  showDiscovery(car);

  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }
}

function showDiscovery(car) {
  guideCard.classList.add("hidden");
  detailCard.classList.add("hidden");
  questionPanel.classList.add("hidden");
  cardsScreen.classList.add("hidden");

  discoveryCarName.textContent = car.name;
  discoveryCard.classList.remove("hidden");
}

function showDetail(car) {
  currentCar = car;

  guideCard.classList.add("hidden");
  discoveryCard.classList.add("hidden");
  questionPanel.classList.add("hidden");
  cardsScreen.classList.add("hidden");

  detailCarName.textContent = car.name;
  detailShort.textContent = car.short;
  detailDescription.textContent = car.description;

  detailCard.classList.remove("hidden");
}

function showGuide() {
  discoveryCard.classList.add("hidden");
  detailCard.classList.add("hidden");
  questionPanel.classList.add("hidden");
  cardsScreen.classList.add("hidden");
  guideCard.classList.remove("hidden");
}

function openQuestionPanel(car) {
  currentCar = car;
  currentQuestionIndex = 0;
  currentAnswers = [];
  selectedAnswer = null;

  detailCard.classList.add("hidden");
  questionPanel.classList.remove("hidden");

  renderQuestion();
}

function getCurrentQuestionFlow() {
  if (!currentCar) return [];
  return questionFlows[currentCar.id] || createGenericQuestionFlow(currentCar);
}

function createGenericQuestionFlow(car) {
  const carName = car.name || "この車";
  const type = car.type || "展示車";

  return [
    {
      id: `${car.id}_first`,
      question: "まず外から見て、どこが気になりましたか？",
      choices: [
        {
          label: "見た目の印象",
          tag: "外観",
          title: "外観の見どころ",
          text: `${carName}の第一印象を、正面・横・後ろから見比べてみてください。形や色、ライトまわりなど、気分が上がるポイントを探してみましょう。`,
          catalogPhrase: "外観の印象をじっくり楽しめる"
        },
        {
          label: "サイズ感",
          tag: "サイズ",
          title: "サイズ感の見どころ",
          text: `${carName}を少し離れて見て、街中や駐車場で使う場面を想像してみてください。大きさの感じ方は実車を見るとわかりやすくなります。`,
          catalogPhrase: "実車でサイズ感を確かめやすい"
        },
        {
          label: "その車らしい個性",
          tag: "個性",
          title: "個性の見どころ",
          text: `${carName}がどんな雰囲気の車なのか、デザインや内装から感じてみてください。${type}らしい魅力を探すのがおすすめです。`,
          catalogPhrase: `${type}らしい個性を感じられる`
        }
      ]
    },
    {
      id: `${car.id}_inside`,
      question: "乗り込んで確認するなら、どこを見たいですか？",
      choices: [
        {
          label: "運転席からの見え方",
          tag: "運転席",
          title: "運転席の見どころ",
          text: "運転席に座れるなら、前方の見え方、ハンドルとの距離、スイッチの位置を確認してみてください。毎日乗るイメージがしやすくなります。",
          catalogPhrase: "運転席からの見え方も確認しやすく"
        },
        {
          label: "後席や荷室",
          tag: "実用性",
          title: "実用性の見どころ",
          text: "後席や荷室を見ると、人を乗せる場面や荷物を積む場面が想像しやすくなります。使い方に合うかを見てみましょう。",
          catalogPhrase: "後席や荷室まで見ると使い方を想像しやすい"
        },
        {
          label: "内装の雰囲気",
          tag: "内装",
          title: "内装の見どころ",
          text: "シート、メーター、操作まわりの雰囲気を見てみてください。写真だけではわかりにくい質感や居心地を感じられます。",
          catalogPhrase: "内装の雰囲気まで楽しめる"
        }
      ]
    },
    {
      id: `${car.id}_life`,
      question: "自分に合うか考えるなら、何が気になりますか？",
      choices: [
        {
          label: "普段使いできるか",
          tag: "普段使い",
          title: "普段使いの見方",
          text: "通勤、買い物、休日のお出かけなど、自分の生活で使う場面を想像してみてください。乗り降りや荷物の置きやすさも大切です。",
          catalogPhrase: "普段使いのイメージもしやすい"
        },
        {
          label: "楽しく乗れそうか",
          tag: "楽しさ",
          title: "楽しさの見方",
          text: "車を移動手段としてだけでなく、乗る時間を楽しめるかという視点で見てみてください。座ったときの気分も大切な判断材料です。",
          catalogPhrase: "乗る時間の楽しさも想像できる"
        },
        {
          label: "自分に似合うか",
          tag: "相性",
          title: "相性の見方",
          text: "スペックだけでなく、実車の前に立ったときの気分も大切です。この車で出かける自分を想像してみてください。",
          catalogPhrase: "自分との相性を考えながら見られる"
        }
      ]
    }
  ];
}

function renderQuestion() {
  const flow = getCurrentQuestionFlow();
  const question = flow[currentQuestionIndex];

  if (!question) return;

  questionProgress.textContent = `見どころ ${currentQuestionIndex + 1} / ${flow.length}`;
  questionText.textContent = question.question;

  choiceOptions.innerHTML = "";
  answerBox.classList.add("hidden");
  selectedAnswer = null;

  question.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice.label;

    button.addEventListener("click", () => {
      selectChoice(choice);
    });

    choiceOptions.appendChild(button);
  });
}

function selectChoice(choice) {
  const flow = getCurrentQuestionFlow();
  const question = flow[currentQuestionIndex];

  selectedAnswer = {
    questionId: question.id,
    question: question.question,
    label: choice.label,
    tag: choice.tag,
    title: choice.title,
    text: choice.text,
    catalogPhrase: choice.catalogPhrase
  };

  const existingIndex = currentAnswers.findIndex(
    (answer) => answer.questionId === selectedAnswer.questionId
  );

  if (existingIndex >= 0) {
    currentAnswers[existingIndex] = selectedAnswer;
  } else {
    currentAnswers.push(selectedAnswer);
  }

  const actionCopy = buildActionCopy(choice);

  answerTitle.textContent = actionCopy.title;
  answerText.textContent = actionCopy.text;
  answerBox.classList.remove("hidden");

  if (currentQuestionIndex >= flow.length - 1) {
    nextQuestionButton.classList.add("hidden");
  } else {
    nextQuestionButton.classList.remove("hidden");
  }

  finishQuestionsButton.textContent =
    currentQuestionIndex >= flow.length - 1
      ? "ミニカタログを作る"
      : "ここまででミニカタログを作る";
}

function buildActionCopy(choice) {
  const actionCopies = {
    "低く流れるようなシルエット": {
      title: "少し離れて、横から見てみましょう",
      text: "Honda Preludeの低く伸びやかなラインは、近くよりも少し離れた位置から見るとわかりやすくなります。前、横、後ろと角度を変えて眺めてみてください。"
    },
    "スポーツカーらしい雰囲気": {
      title: "運転席に乗り込んでみましょう",
      text: "ドアを開けて運転席に座り、目線の低さやハンドルまわりの雰囲気を感じてみてください。走らせなくても、この車のキャラクターが伝わってきます。"
    },
    "大人っぽい特別感": {
      title: "ドアを開けて、内装を見てみましょう",
      text: "外観だけでなく、ドアを開けた瞬間の雰囲気やシートまわりを見てみてください。Preludeの特別感は、乗り込む前後の体験にも表れます。"
    },
    "運転席からの景色": {
      title: "運転席に座って、前を見てみましょう",
      text: "座ったときの目線、前方の見え方、ハンドルとの距離を感じてみてください。この車で走る自分を想像できるかがポイントです。"
    },
    "ハンドルまわりの雰囲気": {
      title: "ハンドルまわりを見てみましょう",
      text: "メーター、スイッチ、ハンドルの位置を見て、運転する気分がどう変わるかを感じてみてください。"
    },
    "後席やトランクの使い勝手": {
      title: "後席とトランクを確認してみましょう",
      text: "後席に目を向けたり、トランクを開けたりして、実際の使い方を想像してみましょう。趣味性と実用性のバランスが見えてきます。"
    },

    "室内が広そうなところ": {
      title: "後席に座ってみましょう",
      text: "N-BOXは外から見たサイズと、中に入ったときの広さのギャップが見どころです。後席に座って、足元や頭上のゆとりを感じてみてください。"
    },
    "家族や友人と使いやすそうなところ": {
      title: "スライドドアを開けてみましょう",
      text: "スライドドアを開けて、乗り降りのしやすさを見てみてください。家族や友人を乗せる場面が想像しやすくなります。"
    },
    "毎日運転しやすそうなところ": {
      title: "運転席からの見晴らしを確認しましょう",
      text: "運転席に座って、前方や左右の見え方を確認してみてください。毎日使う車では、この安心感がとても大切です。"
    },
    "後席の広さ": {
      title: "後席に乗り込んでみましょう",
      text: "足元の広さ、座ったときの姿勢、乗り降りのしやすさを確認してみてください。人を乗せる機会が多い人には大事なポイントです。"
    },
    "スライドドアまわり": {
      title: "スライドドアを開け閉めしてみましょう",
      text: "狭い場所でも乗り降りしやすそうか、開口部が広いかを見てみてください。N-BOXらしい便利さがわかりやすい部分です。"
    },
    "収納や小物置き": {
      title: "小物を置く場所を探してみましょう",
      text: "スマホ、飲み物、バッグなど、普段持ち歩くものをどこに置けそうか想像してみてください。毎日の使いやすさにつながります。"
    },
    "買い物の荷物が積めるか": {
      title: "荷室を開けてみましょう",
      text: "普段の買い物袋や荷物を置く場面を想像しながら、荷室の広さや高さを見てみてください。"
    },

    "小さいのに迫力ある見た目": {
      title: "正面から近づいて見てみましょう",
      text: "Honda Super-ONEは小さなボディに強いキャラクターがあります。正面、斜め前、横から見て、EV Sportらしい存在感を感じてみてください。"
    },
    "EVなのに楽しそうな雰囲気": {
      title: "運転席に座ってみましょう",
      text: "静かに移動するだけのEVではなく、走る気分を盛り上げる小型EVとして、運転席まわりの雰囲気を見てみてください。"
    },
    "BOOSTモードという言葉": {
      title: "BOOSTモードの世界観を探してみましょう",
      text: "実際に走らせることはできませんが、デザインや運転席まわりから、Super-ONEが目指すワクワク感を想像してみてください。"
    },
    "運転席のワクワク感": {
      title: "運転席まわりをじっくり見てみましょう",
      text: "操作まわり、視界、囲まれ感を見ながら、小さなEVで走る楽しさを想像してみてください。"
    },
    "小型EVらしいサイズ感": {
      title: "車のまわりを一周してみましょう",
      text: "街中で使うことを想像しながら、車幅や長さ、取り回しのしやすそうなサイズ感を見てみてください。"
    },
    "操作まわりの未来感": {
      title: "操作まわりの新しさを見てみましょう",
      text: "表示やスイッチまわりを見ながら、EVらしい新しい移動体験を想像してみてください。"
    }
  };

  return actionCopies[choice.label] || {
    title: choice.title || "実車を見てみましょう",
    text: choice.text || "気になったポイントを、実際の車を見たり乗り込んだりしながら確認してみてください。"
  };
}

function goToNextQuestion() {
  if (!selectedAnswer) {
    window.alert("まず3択から1つ選んでください。");
    return;
  }

  const flow = getCurrentQuestionFlow();

  if (currentQuestionIndex < flow.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
  }
}

function finishQuestionsAndCreateCatalog() {
  if (currentAnswers.length === 0) {
    window.alert("少なくとも1つ質問に答えてから、ミニカタログを作れます。");
    return;
  }

  if (!currentCar) return;

  const catalogText = generateMiniCatalogText(currentCar, currentAnswers);
  const tags = currentAnswers.map((answer) => answer.tag);

  const card = {
    id: `${currentCar.id}_${Date.now()}`,
    carId: currentCar.id,
    carName: currentCar.name,
    rarity: currentCar.rarity,
    type: currentCar.type,
    cardColor: currentCar.cardColor,
    cardImage: currentCar.cardImage,
    carImage: currentCar.carImage || currentCar.cardImage,
    cardCatch: "あなただけのミニカタログ",
    personalText: catalogText,
    interests: tags,
    answers: currentAnswers,
    createdAt: new Date().toISOString()
  };

  const existingIndex = personalCards.findIndex((item) => item.carId === currentCar.id);

  if (existingIndex >= 0) {
    personalCards[existingIndex] = card;
  } else {
    personalCards.push(card);
  }

  savePersonalCards();

  questionPanel.classList.add("hidden");
  showCatalogCreatedMessage();

  setTimeout(() => {
    renderCardCarousel();
    cardsScreen.classList.remove("hidden");
  }, 1200);
}

function generateMiniCatalogText(car, answers) {
  const phrases = answers
    .map((answer) => answer.catalogPhrase)
    .filter(Boolean);

  if (car.id === "car01") {
    return generatePreludeCatalog(car, phrases);
  }

  if (car.id === "car02") {
    return generateNboxCatalog(car, phrases);
  }

  if (car.id === "car03") {
    return generateSuperOneCatalog(car, phrases);
  }

  if (phrases.length === 0) {
    return `${car.name}は、実車を見ながら自分に合うポイントを探せる一台です。`;
  }

  return `${car.name}は、${joinPhrases(phrases)}一台です。`;
}

function generatePreludeCatalog(car, phrases) {
  if (phrases.length === 1) {
    return `${car.name}は、${phrases[0]}、運転する時間そのものを楽しみたい人に向いたスペシャリティスポーツです。`;
  }

  if (phrases.length === 2) {
    return `${car.name}は、${phrases[0]}、${phrases[1]}。移動だけでなく、車と過ごす時間まで楽しみたくなる一台です。`;
  }

  return `${car.name}は、${phrases[0]}、${phrases[1]}。さらに${phrases[2]}、趣味性と現実感のバランスまで楽しめるスペシャリティスポーツです。`;
}

function generateNboxCatalog(car, phrases) {
  if (phrases.length === 1) {
    return `${car.name}は、${phrases[0]}、毎日の移動に自然になじむ軽自動車です。日常の使いやすさを大切にしたい人に合いやすい一台です。`;
  }

  if (phrases.length === 2) {
    return `${car.name}は、${phrases[0]}、${phrases[1]}。買い物や送り迎えなど、毎日の小さな移動をラクにしてくれる一台です。`;
  }

  return `${car.name}は、${phrases[0]}、${phrases[1]}。さらに${phrases[2]}、家族や日常の使いやすさをしっかり考えたい人に向いた一台です。`;
}

function generateSuperOneCatalog(car, phrases) {
  if (phrases.length === 1) {
    return `${car.name}は、${phrases[0]}、日常の移動に遊び心を加えてくれる小型EVです。新しいEV体験を楽しみたい人に向いた一台です。`;
  }

  if (phrases.length === 2) {
    return `${car.name}は、${phrases[0]}、${phrases[1]}。街中での扱いやすさと、EV Sportらしいワクワク感を両方楽しめる小型EVです。`;
  }

  return `${car.name}は、${phrases[0]}、${phrases[1]}。さらに${phrases[2]}、小さなEVに未来感と走る楽しさを詰め込んだ一台です。`;
}

function joinPhrases(phrases) {
  if (phrases.length === 0) return "";
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]}、${phrases[1]}`;
  return `${phrases[0]}、${phrases[1]}、${phrases[2]}`;
}

function showCatalogCreatedMessage() {
  const message = document.createElement("div");
  message.className = "catalog-created-message";
  message.innerHTML = `
    <h2>あなただけのミニカタログが作られました！</h2>
    <p>コレクションに保存しました。</p>
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 1800);
}

function renderCollection() {
  const total = cars.length || 3;
  progress.textContent = `${discoveredIds.size} / ${total} 発見`;

  collectionRow.innerHTML = "";

  cars.forEach((car) => {
    const item = document.createElement("div");
    item.className = "collection-item";

    if (discoveredIds.has(car.id)) {
      item.classList.add("discovered");
      item.textContent = `✅ ${shortName(car.name)}`;
    } else {
      item.textContent = `⬜ ${shortName(car.name)}`;
    }

    collectionRow.appendChild(item);
  });
}

function renderCardCarousel() {
  cardCarousel.innerHTML = "";

  if (personalCards.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-card-stage";
    empty.innerHTML = `
      <div class="empty-card-stack">
        <div class="empty-peek-card card-a"></div>
        <div class="empty-peek-card card-b"></div>
        <div class="empty-peek-card card-c"></div>
      </div>
      <p>まだミニカタログはありません。<br>車を見つけて、見どころを選ぶと作成できます。</p>
    `;
    cardCarousel.appendChild(empty);
    return;
  }

  personalCards.forEach((card) => {
    const cardEl = createTradingCardElement(card);
    cardEl.addEventListener("click", () => openCardModal(card));
    cardCarousel.appendChild(cardEl);
  });
}


function normalizeHondaTitle(name) {
  const raw = String(name || "").trim();
  const withoutHonda = raw.replace(/^honda[\s\u3000_-]*/i, "").trim();
  return `HONDA ${withoutHonda || raw}`.toUpperCase();
}

function isLegacyCompletedCard(card) {
  const image = String(card.cardImage || "");
  return /\/(prelude|nbox|superone)-card\.png$/i.test(image);
}

function createTradingCardElement(card) {
  const createdDate = formatDate(card.createdAt);
  const tagsHtml = card.interests.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

  // 既存3車種の「完成済みカード画像」は、そのまま使う。
  if (isLegacyCompletedCard(card) && !String(card.cardImage || "").includes("card-template")) {
    const el = document.createElement("div");
    el.className = "catalog-card-image";
    el.style.backgroundImage = `url("${card.cardImage}")`;
    el.innerHTML = `
      <div class="catalog-card-text">
        <p>${escapeHtml(card.personalText)}</p>
        <div class="catalog-card-tags">
          ${tagsHtml}
          <span>GET ${createdDate}</span>
        </div>
      </div>
    `;
    return el;
  }

  // 店舗追加車両: 渡された card-template.png を台紙としてそのまま使い、
  // その上に車画像・分類・車種名・説明だけを重ねる。
  const templateSrc = "./assets/card-template.png";
  const carPhotoHtml = card.carImage
    ? `<img class="template-card-photo" src="${escapeHtml(card.carImage)}" alt="${escapeHtml(card.carName)}" onerror="this.style.display='none';">`
    : "";

  const el = document.createElement("div");
  el.className = "catalog-card-image catalog-card-template";
  el.innerHTML = `
    <img class="template-card-base" src="${escapeHtml(templateSrc)}" alt="">
    <div class="template-card-photo-frame">
      ${carPhotoHtml}
    </div>
    <div class="template-card-category">${escapeHtml(card.type || "SPECIAL")}</div>
    <div class="template-card-title">${escapeHtml(normalizeHondaTitle(card.carName))}</div>
    <div class="template-card-description">
      <p class="template-card-catch">${escapeHtml(card.cardCatch || "あなただけのミニカタログ")}</p>
      <p class="template-card-body">${escapeHtml(card.personalText)}</p>
      <div class="catalog-card-tags">
        ${tagsHtml}
        <span>GET ${createdDate}</span>
      </div>
    </div>
  `;
  return el;
}

function openCardModal(card) {
  modalCardContent.innerHTML = "";
  const largeCard = createTradingCardElement(card);
  largeCard.classList.add("large-catalog-card");
  modalCardContent.appendChild(largeCard);
  cardModal.classList.remove("hidden");
}

function closeCardModal() {
  cardModal.classList.add("hidden");
  modalCardContent.innerHTML = "";
}

function saveCollection() {
  localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify([...discoveredIds]));
}

function loadCollection() {
  const raw = localStorage.getItem(DISCOVERY_STORAGE_KEY);

  if (!raw) {
    discoveredIds = new Set();
    return;
  }

  try {
    const ids = JSON.parse(raw);
    discoveredIds = new Set(ids);
  } catch (error) {
    console.warn("保存データの読み込みに失敗しました", error);
    discoveredIds = new Set();
  }
}

function savePersonalCards() {
  localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(personalCards));
}

function loadPersonalCards() {
  const raw = localStorage.getItem(CARD_STORAGE_KEY);

  if (!raw) {
    personalCards = [];
    return;
  }

  try {
    const cards = JSON.parse(raw);
    personalCards = Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.warn("カード保存データの読み込みに失敗しました", error);
    personalCards = [];
  }
}

function shortName(name) {
  return name
    .replace("Honda ", "")
    .replace("HONDA ", "");
}

function formatDate(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}/${day}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
}
