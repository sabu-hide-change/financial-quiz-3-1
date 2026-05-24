// npm install lucide-react recharts firebase

import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Check, X, Home, ChevronRight, RefreshCw, Star, BarChart2, BookOpen, AlertCircle, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ==========================================
// Firebase 設定 & 定数 (厳守テンプレート)
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const APP_ID = "QuizApp_001_ProductionManagement";

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 問題集全データ一括定義 (13問フルテキスト収録)
// ==========================================
const MASTER_QUIZZES = [
  {
    id: 1,
    title: "生産管理の定義",
    category: "生産管理と生産方式",
    year: "JIS定義",
    question: "生産管理に関する次の文中の、空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群より選べ。\n\n生産管理とは、財・Ａの生産に関する管理活動のことで、管理対象はＢ・調達・生産の3つから構成される。所定の品質・原価・数量および納期で生産するため、人・物・金・Ｃを駆使して、需要予測・生産計画・生産実施・Ｄを行う手続およびその活動である。",
    options: [
      { key: "ア", text: "Ａ：商品   Ｂ：販売 Ｃ：知識 Ｄ：在庫統制" },
      { key: "イ", text: "Ａ：サービス Ｂ：設計 Ｃ：設備 Ｄ：生産統制" },
      { key: "ウ", text: "Ａ：商品   Ｂ：販売 Ｃ：情報 Ｄ：在庫統制" },
      { key: "エ", text: "Ａ：サービス Ｂ：設計 Ｃ：情報 Ｄ：生産統制" }
    ],
    answer: "エ",
    explanation: {
      summary: "日本産業規格（JIS）の生産管理定義、および構成要素に関する設問です。",
      details: "【JISの定義】財・サービスの生産に関する管理活動。所定の品質・原価・数量および納期で生産するため、またはQ（Quality）・C（Cost）・D（Delivery）に関する最適化を図るため、人、物、金、情報を駆使して、需要予測、生産計画、生産実施、生産統制を行う手続およびその活動。\n狭義には、生産工程における生産統制を意味し、工程管理ともいいます。",
      breakdown: [
        { label: "Ａ：サービス", content: "商品には、販売を目的とする財およびサービスの両方が含まれます。「財」は既に記載されていますから、この選択肢には「サービス」を入れるのが適切です。" },
        { label: "Ｂ：設計", content: "生産の構成要素である「設計・調達・作業」活動を、QCDの観点から最適化を図る管理活動と言えます。販売は生産活動ではないため不適切です。" },
        { label: "Ｃ：情報", content: "企業の経営資源は、人・もの・金・情報で定義されます。「設備」と「知識」は、それぞれ「モノ」と「情報」に含まれます。" },
        { label: "Ｄ：生産統制", content: "在庫の統制や管理は、生産統制の一部です。よって生産統制の方が選択肢としては、より適切となります。" }
      ]
    }
  },
  {
    id: 2,
    title: "生産の管理目標",
    category: "生産管理と生産方式",
    year: "管理指標",
    question: "生産における管理目標（P,Q,C,D,S,M,E)の記号と活動例の組み合わせとして、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "P－購買部門では、材料を安く購入するため複数のサプライヤーから見積もりを入手する。" },
      { key: "イ", text: "D－生産管理部門では、納期を守るため資材の在庫状況や作業の進捗状況を定期的に確認する。" },
      { key: "ウ", text: "C－品質部門では、出荷前に製品に異常がないか検査を行う。" },
      { key: "エ", text: "S-設計部門では、前モデルに対して消費電力が50%少なくなるように新製品を開発した。" }
    ],
    answer: "イ",
    explanation: {
      summary: "生産現場における7つの管理目標である、PQCDSMEの内容を問われています。英単語とその意味を正しく暗記することがポイントです。",
      tableType: "pqcdsme",
      details: "各選択肢の解説は以下の通りです。",
      breakdown: [
        { label: "ア：×", content: "安価で材料を購入する活動は、原価に関するものですからCost（C）に該当します。PはProductivity（生産性）に関する活動です。" },
        { label: "イ：○", content: "現品管理や進捗管理は、納期を守るための活動ですからDelivery（D）に該当します。記述は適切です。" },
        { label: "ウ：×", content: "品質をチェックする出荷検査は、品質を維持するための活動ですからQuality（Q）に該当します。Cはコストに関する活動です。" },
        { label: "エ：×", content: "消費電力が少なくなるような活動は、環境に配慮した活動ですからEnvironment（E）に該当します。SはSafety（安全性）に関する活動です。" }
      ]
    }
  },
  {
    id: 3,
    title: "生産効率化の原則",
    category: "生産管理と生産方式",
    year: "効率化原則",
    question: "生産を効率化し、生産性を高めるためには、幾つかの原則がある。これらの原則の説明として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "ネジの締め付け工程を、手作業から電動ドライバを用いる方法に変更することで作業時間を短縮した。この内容は、ECRSの原則のRを適用したことになる。" },
      { key: "イ", text: "電話応対に関するルールを決めて、全社員がこれを徹底することにした。この内容は5Sの原則の躾を適用したことになる。" },
      { key: "ウ", text: "作業者によって、品質や作業時間に大きなばらつきが生じないように、作業手順を書類にした。この内容は3Sの原則の標準化を適用したことになる。" },
      { key: "エ", text: "工場の部品棚に保管していた部品の中で、古くて使う予定がないものを廃棄した。この内容は5Sの原則の整頓を適用したことになる。" },
      { key: "オ", text: "同じ顧客へ送る荷物を一つに纏めることで、送料を下げることが出来た。この内容は、ECRSの原則のCを適用したことになる。" }
    ],
    answer: "エ",
    explanation: {
      summary: "生産の効率化の原則として「3S」「5S」「ECRS」の3種類があり、その内容の正しい理解が問われています。",
      tableType: "3s_5s_ecrs",
      details: "5Sの『整理』と『整頓』、ECRSの『R』と『S』は混乱しやすいので注意が必要です。",
      breakdown: [
        { label: "ア：○", content: "作業を別の方法（手作業→電動ドライバ）に置き換えています。ECRSの原則では置き換え（Replace）に該当し適切です。（※ネジから接着への変更ならSimplifyになります）" },
        { label: "イ：○", content: "決めたルールを全員で守るようにすることは、5Sの原則では『躾』に該当し適切です。" },
        { label: "ウ：○", content: "作業手順を書類（作業標準書）にすることは、3Sの原則では『標準化（Standardization）』に該当し適切です。" },
        { label: "エ：×", content: "古くて使う予定のない部品を廃棄するのは、要らないものを処分しているため、5Sの原則では『整理』に該当します。『整頓』ではないため不適切です。" },
        { label: "オ：○", content: "複数の荷物を一つに纏めることで送料を削減（改善）しているので、ECRSの原則では『C（Combine：一緒にする）』に該当し適切です。" }
      ]
    }
  },
  {
    id: 4,
    title: "生産効率化（用語・計算式）",
    category: "生産管理と生産方式",
    year: "効率化指標",
    question: "生産の効率化に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "生産性は、産出された量に対する投入した量の比率で求めることができる。" },
      { key: "イ", text: "稼働率は、人または機械の利用可能時間に対する有効稼働時間との比率である。" },
      { key: "ウ", text: "歩留りは、投入された主原材料の量とその主原材料から実際に産出された品物の量との比率である。" },
      { key: "エ", text: "生産リードタイムは、生産を着手してから出荷できる状態になるまでの時間を指し、工程間で滞留していた時間も生産リードタイムに含まれる。" }
    ],
    answer: "ア",
    explanation: {
      summary: "生産の効率化に関する主要な4つの用語の定義に関する問題です。",
      details: "【各種指標の定義】\n◆生産性 ＝ 産出量 ÷ 投入量 (投入量に対する産出量の比)\n◆稼働率 ＝ 有効稼働時間 ÷ 利用可能時間 (または就業時間)\n◆生産リードタイム ＝ 生産着手から完了(出荷可能状態)までの時間。工程間の滞留時間も含む。\n◆歩留り ＝ 実際に産出された良品量 ÷ 投入された主原材料量。材料の有効活用度を示す。",
      breakdown: [
        { label: "ア：×", content: "生産性は「投入された量に対する産出した量の比率（産出量÷投入量）」であるため、選択肢の記述は分母と分子が逆になっています。よって不適切です。" },
        { label: "イ：○", content: "稼働率の正しい定義です。有効稼働時間とは、生産に直接役立っている時間を指します。" },
        { label: "ウ：○", content: "歩留りの正しい定義です。材料をいかに無駄なく有効に使ったかを表す指標です。" },
        { label: "エ：○", content: "生産リードタイムの正しい定義です。複数工程の場合、工程間の滞留時間（待ち時間）も含まれます。" }
      ]
    }
  },
  {
    id: 5,
    title: "自主管理活動",
    category: "生産管理と生産方式",
    year: "小集団活動",
    question: "自主管理活動に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "組織において、トップダウンの命令系統を重視した活動である。" },
      { key: "イ", text: "QCサークルは自発的に集まった仲間でグループを構成して、会社の品質に関する問題の解決にあたる活動である。" },
      { key: "ウ", text: "活動を行う目的の一つとして、従業員の自発性を高めることがある。" },
      { key: "エ", text: "QCサークルは品質（Q）とコスト（C）を中心に改善を行う自主管理活動である。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "現場の従業員が自主性を発揮して行う小集団活動（自主管理活動）の目的と内容に関する問題です。",
      details: "自主管理活動は従業員の自主性を重視し、能力や創意工夫を引き出すことが目的です。経営者が強制（トップダウン命令）すると自主管理活動ではなくなる点がポイントです。",
      breakdown: [
        { label: "ア：×", content: "トップからの命令ではなく従業員の自発性を重視した活動です。" },
        { label: "イ：×", content: "QCの小集団は「同じ職場や同じ業務をするグループ」で構成するのが一般的です。「自発的に集まった仲間（部門横断など）」ではないため不適切です。" },
        { label: "ウ：○", content: "従業員の自主性を重んじて、自発性を高めることが重要な目的の一つです。適切です。" },
        { label: "エ：×", content: "QCサークル（Quality Control）は、業務や製品の「品質（Q）の向上」を中心に行う活動であり、C（コスト）中心ではありません。" }
      ]
    }
  },
  {
    id: 6,
    title: "受注生産と見込生産",
    category: "生産管理と生産方式",
    year: "生産タイミング",
    question: "受注生産と見込生産に関する説明として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "受注生産には、個別受注生産と繰返し受注生産がある。" },
      { key: "イ", text: "受注生産は、生産リードタイムの短縮や受注の平準化が重点課題となる。" },
      { key: "ウ", text: "見込生産は、需要量を予測して製品を作り、その作った製品は注文を受けてから販売するため、顧客が注文してからの納期が長くなる。" },
      { key: "エ", text: "見込生産は、需要の予測精度を高めることや、需要変動に柔軟に対応できる生産体制の確立が重点課題となる。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "製品を生産するタイミングによる分類（受注生産と見込生産）の特徴・課題を問う問題です。",
      details: "【受注生産】注文を受けてから生産開始。リードタイム短縮、納期遵守、受注平準化（操業度安定のため）が課題。\n【見込生産】需要予測に基づき予め生産して在庫を販売。注文後の納期は短い。需要予測の精度向上（過剰在庫・機会損失防止）や需要変動への柔軟な体制が課題。",
      breakdown: [
        { label: "ア：○", content: "毎回設計から行う個別受注生産と、設計は事前に行っておく繰返し受注生産の2つがあり適切です。" },
        { label: "イ：○", content: "受注後に生産するため、顧客向けにはリードタイム短縮、自社向けには工場の稼働を安定させるための受注平準化が課題となり適切です。" },
        { label: "ウ：×", content: "見込生産はあらかじめ作ってある在庫から即座に販売・出荷するため、顧客が注文してからの納期は「短く」なります。記述は逆のため不適切です。" },
        { label: "エ：○", content: "予測に基づき生産するため、予測精度の向上と、外れた場合の需要変動に追従できる柔軟な体制づくりが重点課題であり適切です。" }
      ]
    }
  },
  {
    id: 7,
    title: "生産形態の分類",
    category: "生産管理と生産方式",
    year: "品種と量とレイアウト",
    question: "製品の生産は、その種類と量によって、適した生産形態やレイアウトが選択される。次の組み合わせで、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "連続生産 － 少品種多量生産 － 製品別レイアウト" },
      { key: "イ", text: "ロット生産 － 見込生産 － グループ別レイアウト" },
      { key: "ウ", text: "個別生産 － 多品種少量生産 － 機能別レイアウト" },
      { key: "エ", text: "連続生産 － 受注生産 － 製品別レイアウト" },
      { key: "オ", text: "ロット生産 － 中品種中量生産 － グループ別レイアウト" }
    ],
    answer: "エ",
    explanation: {
      summary: "生産形態の3つの分類（個別・ロット・連続）と、設備レイアウト（機能別・グループ別・製品別）の一般的な関連性を問う問題です。",
      tableType: "production_types",
      details: "品種・量、生産タイミング、設備レイアウト、段取り替えの特徴はマトリクスでセットで暗記すべき重要分野です。",
      breakdown: [
        { label: "ア：○", content: "連続生産は少品種多量生産に適しており、製品の加工フローに沿った製品別レイアウトが採用されます。" },
        { label: "イ：○", content: "ロット生産は、見込生産・受注生産どちらにも用いられ、グループ別レイアウトとの相性も良いです。" },
        { label: "ウ：○", content: "個別生産は多品種少量生産に強く、様々な加工に対応できるよう同種機械を集めた機能別レイアウトが多くなります。" },
        { label: "エ：×", content: "連続生産は同一製品をずっと大量生産する形態であるため、通常は需要予測に基づく『見込生産』が一般的です。受注生産を組み合わせるのは不適切です。" },
        { label: "オ：○", content: "ロット生産は「中品種中量生産」と最も強い関係があり、グループ別レイアウトが多く採用され適切です。" }
      ]
    }
  },
  {
    id: 8,
    title: "段取り（内段取りと外段取り）",
    category: "生産管理と生産方式",
    year: "段取り替えの効率化",
    question: "生産効率やライン稼働率を向上するために重要な段取りに関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "ロット生産において、まとめ生産の量が減少すると、段取り頻度は減る傾向にある。" },
      { key: "イ", text: "設備の稼働率を高めるために、内段取りを外段取りに変更した。" },
      { key: "ウ", text: "生産効率を上げるため、生産計画を立てる際に、同一工程で生産する別の製品を続けて生産することを検討した。" },
      { key: "エ", text: "段取り時間を短縮して10分未満にすることを、シングル段取りと呼ぶ。" }
    ],
    answer: "ア",
    explanation: {
      summary: "生産効率に直結する段取り（準備・切替作業）の用語定義と、生産量・計画との関係に関する問題です。",
      details: "【重要キーワード】\n・内段取り：生産ラインを「停止」して行う段取り作業。\n・外段取り：生産ラインを「停止せず外で並行して」行う作業。内→外への移行は稼働率を高めます。\n・シングル段取り：段取り時間を10分未満（1桁分＝シングル）に短縮すること。\n・ゼロ段取り：3分以内、限りなくゼロを目指すもの。",
      breakdown: [
        { label: "ア：×", content: "ロット生産で「まとめ生産の量（ロットサイズ）」が減少すると、同じ量を売るためにより頻繁に品種を切り替える必要があります。よって段取り頻度は「増える」ため不適切です。" },
        { label: "イ：○", content: "内段取り（ライン停止）を外段取り（ライン稼働中に外で準備）に移行すれば、停止時間が減り稼働率が上がります。適切です。" },
        { label: "ウ：○", content: "同一工程・類似製品をまとめて連続生産すれば、品種切替時の段取り作業を最小限（類似段取り）に抑えることができるため適切です。" },
        { label: "エ：○", content: "段取り時間を10分未満にすることをシングル段取りと呼ぶため適切です。" }
      ]
    }
  },
  {
    id: 9,
    title: "生産方式（ライン生産 vs セル生産）",
    category: "生産管理と生産方式",
    year: "方式の比較",
    question: "生産方式に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "ライン生産方式からセル生産方式に変更するため、類似の加工物をグループ化し、機械の配置を見直した。" },
      { key: "イ", text: "ライン方式は、セル生産方式と比べて作業者の育成に時間がかかる。" },
      { key: "ウ", text: "ラインバランシングを向上するため、ライン生産方式からセル生産方式に切替えた。" },
      { key: "エ", text: "工程間の仕掛品をなくすため、ライン生産方式からセル生産方式（1人生産方式）に変更した。" }
    ],
    answer: "イ",
    explanation: {
      summary: "流れ作業である「ライン生産方式」と、多能工による小集団・単独作業である「セル生産方式」の比較問題です。",
      details: "ライン生産方式は細分化された単一工程を担当する（単能工）ため育成が容易ですが、セル生産方式は1人で多くの、あるいは全工程を担当する（多能工）ため、習熟・育成に時間がかかります。",
      breakdown: [
        { label: "ア：○", content: "セル生産では、類似性（形状・工程など）に基づいて部品を分類するグループテクノロジー（GT）を活用するため、記述は適切です。" },
        { label: "イ：×", content: "ライン生産は1つの作業に特化するため育成時間は短いですが、セル生産は複数工程を持つため育成に時間がかかります。「ラインの方が時間がかかる」という記述は逆で不適切です。" },
        { label: "ウ：○", content: "セル生産（特に1人方式）では工程間の手待ちやバランスロスが原理的に発生しないため、ラインバランシング問題の根本解決（ロス低下）として切替は有効です。適切です。" },
        { label: "エ：○", content: "1人が最初から最後まで作れば、工程間で物が滞留しないため仕掛品が発生しません。仕掛品削減目的の変更として適切です。" }
      ]
    }
  },
  {
    id: 10,
    title: "セル生産方式の特徴",
    category: "生産管理と生産方式",
    year: "セル生産詳細",
    question: "セル生産方式に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "セル生産方式は、主にU字ライン方式と1人生産方式がある。" },
      { key: "イ", text: "セル生産方式は、うまく導入すればバランスロスが少なくなり、仕掛品在庫を削減して、生産性を高めることができる。" },
      { key: "ウ", text: "U字ライン方式では、作業者が1人で複数の工程を担当するため、短期間で作業を修得できるといったメリットがある。" },
      { key: "エ", text: "1人生産方式では、1人で最初から最後までの作業を行うため、基本的に工程間の仕掛品が発生しないといったメリットがある。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "セル生産方式の代表的な2形態「U字ライン方式」と「1人生産方式」のメリット・デメリットを問う問題です。",
      details: "セル生産方式の最大の前提は、作業者が複数の工程をこなせる『多能工』であることです。これは、モチベーション向上やロス削減のメリットがある反面、習熟に時間がかかるデメリットと表裏一体です。",
      breakdown: [
        { label: "ア：○", content: "代表的なセル生産の形態としてU字ライン方式と1人生産方式があり適切です。" },
        { label: "イ：○", content: "1人ないし少数で複数工程を柔軟にカバーするため、工程間の待ち（バランスロス）が減り仕掛品も削減できます。適切です。" },
        { label: "ウ：×", content: "1人で複数の工程を担当するため、作業の習熟には「多くの時間がかかる（長期間を要する）」のがデメリットです。「短期間で修得できる」という記述は不適切です。" },
        { label: "エ：○", content: "1人の人間が原材料から完成までを連続して作業するため、工程間でバッファ（仕掛品）を持たせる必要がなく、発生しないという記述は適切です。" }
      ]
    }
  },
  {
    id: 11,
    title: "ライン生産方式の特徴",
    category: "生産管理と生産方式",
    year: "ライン生産詳細",
    question: "ライン生産方式に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "ライン生産方式は、単能工で作業を行うため生産性が高く、管理しやすいことがメリットである。" },
      { key: "イ", text: "ライン生産方式は、製品や生産量の変化に柔軟に対応しにくい点がデメリットである。" },
      { key: "ウ", text: "ライン生産方式は、生産計画を変更した場合にレイアウトを柔軟に変更しやすいというメリットがある。" },
      { key: "エ", text: "ライン生産方式には、特定の単一品種を連続して生産する方式と、同じラインで複数の品種を生産する方式がある。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "大量生産・連続生産に適したライン生産方式のメリット・デメリットおよび分類に関する設問です。",
      tableType: "line_production_features",
      details: "固定された専用の設備フロー（コンベア等）を組むため、一度設置したラインの変更やレイアウト修正は非常に困難です。",
      breakdown: [
        { label: "ア：○", content: "各作業者は1つのシンプルな作業のみを担当する（単能工）ため、標準化しやすく生産性が高まり管理も容易です。適切です。" },
        { label: "イ：○", content: "専用ラインを構築するため、多品種への切り替えや急な増減産など、製品・量の変化への柔軟性（フレキシビリティ）が低いのがデメリットで適切です。" },
        { label: "ウ：×", content: "設備レイアウトの制約が大きく、生産計画の変更に応じて柔軟にレイアウトを変えることは困難です。これはむしろ「セル生産方式」のメリットであるため不適切です。" },
        { label: "エ：○", content: "単一品種ラインのほか、同一ラインで複数品種を流す「多品種ライン（ライン切り換え方式・混合ライン方式）」があり、記述は適切です。" }
      ]
    }
  },
  {
    id: 12,
    title: "ラインバランシングの定義",
    category: "生産管理と生産方式",
    year: "ラインバランス基礎",
    question: "ラインバランシングに関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "ラインバランシングとは、生産ライン上の各工程の作業時間をなるべく均一にすることを指す。" },
      { key: "イ", text: "ピッチダイアグラムでは、各作業ステーションを横軸に取り、作業時間を縦軸で表す。" },
      { key: "ウ", text: "生産ラインに資材を投入する時間間隔をサイクルタイムという。" },
      { key: "エ", text: "サイクルタイムは、最も作業時間が短い作業ステーションの作業時間と同じになる。" }
    ],
    answer: "エ",
    explanation: {
      summary: "ライン生産の効率化に不可欠な「ラインバランシング」および関連用語（サイクルタイム、ピッチダイアグラム）の定義問題です。",
      details: "生産ライン全体の生産速度であるサイクルタイム（ピッチタイム）は、最も作業の遅い（時間がかかる）『ボトルネック工程』の作業時間によって決定されます。",
      breakdown: [
        { label: "ア：○", content: "各工程の作業時間を均一化して手待ちや仕掛品を無くす活動そのものの定義であり、適切です。" },
        { label: "イ：○", content: "ピッチダイアグラムの軸の定義（横軸：作業ステーション、縦軸：作業時間）として正しく、適切です。" },
        { label: "ウ：○", content: "資材の投入間隔、または次の完成品が出てくる時間間隔をサイクルタイム（ピッチタイム）と呼ぶため、適切です。" },
        { label: "エ：×", content: "サイクルタイムは、最も作業時間が『長い（遅い）』作業ステーションの時間と等しくなります。短い時間に合わせて資材を流すと、遅い工程の前で大渋滞（仕掛品山積み）が起きるためです。よって不適切です。" }
      ]
    }
  },
  {
    id: 13,
    title: "ライン編成効率の計算",
    category: "生産管理と生産方式",
    year: "計算問題",
    question: "次の表に示されるラインがある（工程A=5分, B=4分, C=8分, D=6分, E=7分）。このラインの記述に関して、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "このラインのライン編成効率は、80%である。" },
      { key: "イ", text: "作業工程Bの手前では手待ちが発生し、作業工程Eの手前では仕掛品の数が最も多くなる。" },
      { key: "ウ", text: "全ての工程の作業負荷を均一にしたところ、生産性が25%改善した。" },
      { key: "エ", text: "作業工程を一つ追加して、ラインバランスを見直すことで、サイクルタイム数を最大で4分まで短縮できる。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "実際の数値データをもとに、ライン編成効率、サイクルタイム、工程間のロス（手待ち・仕掛品）を分析・計算する応用問題です。",
      details: "【基礎データの算出】\n・作業ステーション数 (N) ＝ 5\n・各工程の時間：A=5, B=4, C=8, D=6, E=7\n・作業時間の合計 (∑t) ＝ 5 + 4 + 8 + 6 + 7 ＝ 30分\n・サイクルタイム (CT) ＝ 最長工程時間 ＝ 8分 (工程Cがボトルネック)",
      breakdown: [
        { label: "ア：×", content: "ライン編成効率 ＝ ∑t ÷ (CT × N) ＝ 30 ÷ (8 × 5) ＝ 30 ÷ 40 ＝ 75% となります。80%ではないため不適切です。" },
        { label: "イ：×", content: "前工程より自工程が「短い」と手待ち、「長い」と仕掛品が手前に発生します。A(5分)→B(4分)なのでBの手前は『仕掛品』が発生し、記述前半から誤りです。また時間差が最大なのはB(4分)→C(8分)の間なので、仕掛品が最大になるのは『Cの手前』です。" },
        { label: "ウ：○", content: "現状のサイクルタイムは8分（1個作るのに8分）。完全均一（編成効率100%）にすると、1工程あたり 30分÷5工程＝6分 となり、サイクルタイムは6分に短縮されます。ピッチが8分から6分へ [ (8-6)/8 = 25% ] 縮小したため、必要なサイクル時間自体が25%効率化（改善）されたとみなせます。よって記述は適切です。" },
        { label: "エ：×", content: "工程数を6つ（1追加）に増やしても、総時間30分を6で割った限界平均値は 30÷6＝5分 です。どれだけ綺麗に配分してもサイクルタイムを「4分」まで下げることは不可能であるため、不適切です。" }
      ]
    }
  }
];

// ==========================================
// メイン React アプリケーションコンポーネント
// ==========================================
export default function App() {
  // 認証・システム状態
  const [userKey, setUserKey] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("start"); // start, quiz, history, result

  // 学習・進捗データ
  const [userHistory, setUserHistory] = useState({}); // { [quizId]: { wrongCount: 0, isReview: false, lastResult: true/false } }
  const [currentQuizzes, setCurrentQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState("all"); // all, wrong, review

  // 解答中の一時状態
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 再開確認のポップアップ/案内用状態
  const [hasSaveData, setHasSaveData] = useState(false);
  const [savedProgress, setSavedProgress] = useState({ index: 0, mode: "all" });

  // 初回ロード時の匿名認証
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Firebase 匿名認証を開始します...");
        const auth = getAuth(app);
        await signInAnonymously(auth);
        console.log("Firebase 匿名認証に成功しました。");
      } catch (error) {
        console.error("Authentication Error:", error);
      }
    };
    initAuth();
  }, []);

  // ユーザーID確認・同期処理
  const handleConnectUser = async (e) => {
    e.preventDefault();
    if (!userKey.trim()) return alert("合言葉またはユーザーIDを入力してください。");

    setLoading(true);
    console.log(`Firestoreからユーザーデータを取得中... ID: ${userKey}`);
    try {
      const docRef = doc(db, APP_ID, userKey.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("ユーザーデータの復元に成功:", data);
        setUserHistory(data.history || {});
        
        // 途中再開データの有無チェック
        if (data.progressIndex !== undefined && data.progressIndex > 0) {
          setHasSaveData(true);
          setSavedProgress({
            index: data.progressIndex,
            mode: data.progressMode || "all"
          });
          console.log(`途中再開用データを発見: インデックス ${data.progressIndex}, モード ${data.progressMode}`);
        } else {
          setHasSaveData(false);
        }
      } else {
        console.log("新規ユーザーとして初期化します。");
        setUserHistory({});
        setHasSaveData(false);
      }
      setIsAuth(true);
    } catch (error) {
      console.error("Firestore Read Error:", error);
      alert("データの取得に失敗しました。オフライン状態か、設定を確認してください。");
      setUserHistory({});
    } finally {
      setLoading(false);
    }
  };

  // クラウドへの進捗一括保存処理 (防衛的 try-catch 完備)
  const saveToCloud = async (updatedHistory, currentIdx = null, mode = null) => {
    if (!userKey.trim()) return;
    try {
      const docRef = doc(db, APP_ID, userKey.trim());
      
      // 保存用オブジェクトの構築
      const payload = {
        history: updatedHistory,
        updatedAt: new Date().toISOString()
      };

      if (currentIdx !== null) payload.progressIndex = currentIdx;
      if (mode !== null) payload.progressMode = mode;

      console.log("Firestoreへ進行状況を強制保存中...", payload);
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.error("Firestore Write Error:", error);
    }
  };

  // クイズ開始・問題リスト構築
  const startQuizFlow = (mode, resumeIndex = null) => {
    console.log(`クイズセッションを開始します。モード: ${mode}, 開始インデックス: ${resumeIndex || 0}`);
    let filtered = [];

    if (mode === "all") {
      filtered = [...MASTER_QUIZZES];
    } else if (mode === "wrong") {
      filtered = MASTER_QUIZZES.filter(q => {
        const hist = userHistory[q.id];
        return hist && hist.lastResult === false;
      });
    } else if (mode === "review") {
      filtered = MASTER_QUIZZES.filter(q => {
        const hist = userHistory[q.id];
        return hist && hist.isReview === true;
      });
    }

    if (filtered.length === 0) {
      alert("該当する問題がありません。すべての問題からスタートしてください。");
      return;
    }

    setCurrentQuizzes(filtered);
    setSelectedMode(mode);
    const startIdx = resumeIndex !== null ? resumeIndex : 0;
    setCurrentIndex(startIdx);
    
    // 一時状態のリセット
    setSelectedAnswer(null);
    setIsAnswered(false);
    setViewMode("quiz");

    // 開始位置の保存
    saveToCloud(userHistory, startIdx, mode);
  };

  // 途中再開か、最初からかの分岐処理
  const handleResumeDecision = (shouldResume) => {
    setHasSaveData(false);
    if (shouldResume) {
      startQuizFlow(savedProgress.mode, savedProgress.index);
    } else {
      // 最初から始める場合は進捗データをリセット
      saveToCloud(userHistory, 0, "all");
      startQuizFlow("all", 0);
    }
  };

  // 解答時の処理
  const handleAnswerClick = (optionKey) => {
    if (isAnswered) return;
    setSelectedAnswer(optionKey);
    setIsAnswered(true);

    const currentQuiz = currentQuizzes[currentIndex];
    const isCorrect = optionKey === currentQuiz.answer;

    // 履歴オブジェクトのディープコピーと更新
    const currentHist = userHistory[currentQuiz.id] || { wrongCount: 0, isReview: false, lastResult: true };
    const updatedHist = {
      ...userHistory,
      [currentQuiz.id]: {
        ...currentHist,
        lastResult: isCorrect,
        wrongCount: isCorrect ? currentHist.wrongCount : (currentHist.wrongCount || 0) + 1
      }
    };

    setUserHistory(updatedHist);
    console.log(`問題解答: ID ${currentQuiz.id}, 正誤: ${isCorrect}`);

    // 即時クラウドセーブ（途中再開用のProgressも更新）
    saveToCloud(updatedHist, currentIndex, selectedMode);
  };

  // 要復習チェックボックス反転処理
  const toggleReviewFlag = () => {
    const currentQuiz = currentQuizzes[currentIndex];
    if (!currentQuiz) return;

    const currentHist = userHistory[currentQuiz.id] || { wrongCount: 0, isReview: false, lastResult: true };
    const updatedHist = {
      ...userHistory,
      [currentQuiz.id]: {
        ...currentHist,
        isReview: !currentHist.isReview
      }
    };

    setUserHistory(updatedHist);
    console.log(`要復習ステータス変更: ID ${currentQuiz.id} -> ${!currentHist.isReview}`);
    saveToCloud(updatedHist, currentIndex, selectedMode);
  };

  // 次の問題へ、または終了画面へ
  const handleNextQuiz = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < currentQuizzes.length) {
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
      saveToCloud(userHistory, nextIdx, selectedMode);
    } else {
      console.log("全問回答完了。セッション進捗をクリアします。");
      setViewMode("result");
      // 完走したため途中再開用のprogressIndexを0にリセット
      saveToCloud(userHistory, 0, selectedMode);
    }
  };

  // ホームに戻る際のエスケープ処理
  const handleReturnHome = () => {
    console.log("ホーム画面へ戻ります。現在の位置を一時保存。");
    // ホームに戻る際も、その解答途中のインデックスを保持させておく
    saveToCloud(userHistory, viewMode === "quiz" ? currentIndex : 0, selectedMode);
    setViewMode("start");
  };

  // 統計データの作成 (Recharts用)
  const prepareChartData = () => {
    return MASTER_QUIZZES.map(q => {
      const hist = userHistory[q.id];
      return {
        name: `問${q.id}`,
        "誤答回数": hist ? (hist.wrongCount || 0) : 0
      };
    });
  };

  // ローディング画面
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-700">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-medium">データを同期しています...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* 共通ヘッダー */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReturnHome}>
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">スマート問題集 3-1</h1>
          </div>
          {isAuth && (
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                キー: <strong className="text-blue-400">{userKey}</strong>
              </span>
              <button 
                onClick={() => setViewMode(viewMode === "history" ? "start" : "history")}
                className="flex items-center space-x-1 text-slate-300 hover:text-white transition"
              >
                <BarChart2 className="w-4 h-4" />
                <span>{viewMode === "history" ? "ホーム" : "分析・履歴"}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ==========================================
            A. ログイン・認証・初期トップ画面
           ========================================== */}
        {!isAuth && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mt-8 border border-slate-200">
            <div className="text-center mb-6">
              <div className="inline-flex bg-blue-50 p-3 rounded-full mb-3 text-blue-600">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">生産管理と生産方式</h2>
              <p className="text-sm text-slate-500 mt-1">学習履歴を完全同期するための合言葉を入力してください</p>
            </div>

            <form onSubmit={handleConnectUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ユーザーID または 秘密の合言葉
                </label>
                <input
                  type="text"
                  placeholder="例: my-study-token-2026"
                  value={userKey}
                  onChange={(e) => setUserKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-900 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
              >
                学習を開始する (同期)
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center leading-relaxed">
              PCで進めた履歴も、同じ合言葉を入力することでスマートフォンからそのまま続きを再開できます。
            </div>
          </div>
        )}

        {/* ==========================================
            B. メインメニュー画面（認証後）
           ========================================== */}
        {isAuth && viewMode === "start" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 途中再開案内ダイアログ */}
            {hasSaveData && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg">前回の続きから再開できます</h3>
                    <p className="text-amber-800 text-sm mt-1">
                      前回は <span className="font-bold bg-amber-200 px-2 py-0.5 rounded text-amber-950">モード: {savedProgress.mode === "all" ? "すべての問題" : savedProgress.mode === "wrong" ? "前回不正解" : "要復習"}</span> の <span className="font-bold underline">問題 {savedProgress.index + 1}</span> まで進んでいます。
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleResumeDecision(true)}
                    className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
                  >
                    続きから再開する
                  </button>
                  <button
                    onClick={() => handleResumeDecision(false)}
                    className="flex-1 md:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm transition"
                  >
                    最初から
                  </button>
                </div>
              </div>
            )}

            {/* モード選択パネル */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <span>出題モードを選択してください</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* モード1: すべて */}
                <button
                  onClick={() => startQuizFlow("all")}
                  className="bg-slate-50 hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-400 p-6 rounded-2xl text-left transition-all group relative overflow-hidden"
                >
                  <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl inline-block mb-4 font-bold text-sm">
                    全 {MASTER_QUIZZES.length} 問
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">すべての問題</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">問題集に収録されている全ての基本・応用設問を最初から解き進めます。</p>
                  <ChevronRight className="absolute bottom-4 right-4 text-slate-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition" />
                </button>

                {/* モード2: 前回不正解 */}
                <button
                  onClick={() => startQuizFlow("wrong")}
                  className="bg-slate-50 hover:bg-red-50/50 border-2 border-slate-200 hover:border-red-400 p-6 rounded-2xl text-left transition-all group relative overflow-hidden"
                >
                  <div className="bg-red-100 text-red-700 p-2.5 rounded-xl inline-block mb-4 font-bold text-sm">
                    弱点克服
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">前回不正解の問題のみ</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">過去に間違えてしまった問題だけを抽出し、効率的にリトライします。</p>
                  <ChevronRight className="absolute bottom-4 right-4 text-slate-400 group-hover:text-red-500 transform group-hover:translate-x-1 transition" />
                </button>

                {/* モード3: 要復習 */}
                <button
                  onClick={() => startQuizFlow("review")}
                  className="bg-slate-50 hover:bg-amber-50/50 border-2 border-slate-200 hover:border-amber-400 p-6 rounded-2xl text-left transition-all group relative overflow-hidden"
                >
                  <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl inline-block mb-4 font-bold text-sm">
                    ブックマーク
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">要復習の問題のみ</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">自分で「要復習」にチェックを入れた要警戒問題を重点的に見直します。</p>
                  <ChevronRight className="absolute bottom-4 right-4 text-slate-400 group-hover:text-amber-500 transform group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            {/* クイック統計サマリー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">総問題数</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{MASTER_QUIZZES.length}問</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">着手済み</div>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {Object.keys(userHistory).length}問
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">要復習フラグ</div>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {Object.values(userHistory).filter(h => h.isReview).length}問
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">現在不正解キープ</div>
                <div className="text-2xl font-black text-red-500 mt-1">
                  {Object.values(userHistory).filter(h => h.lastResult === false).length}問
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            C. クイズ出題・解答・解説画面
           ========================================== */}
        {isAuth && viewMode === "quiz" && currentQuizzes[currentIndex] && (
          <div className="space-y-6">
            {/* ステータス情報 */}
            <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-sm">
              <div className="flex items-center space-x-2 text-slate-600 font-medium">
                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                  {currentQuizzes[currentIndex].category}
                </span>
                <span>{currentQuizzes[currentIndex].year}</span>
              </div>
              <div className="font-bold text-slate-700">
                進行状況: <span className="text-blue-600">{currentIndex + 1}</span> / {currentQuizzes.length} 問目
              </div>
            </div>

            {/* 問題提示カード */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                問題 {currentQuizzes[currentIndex].id} : {currentQuizzes[currentIndex].title}
              </h3>
              <div className="text-slate-900 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                {currentQuizzes[currentIndex].question}
              </div>

              {/* ========================================================
                  重要要件：問題文中の図・表のHTML/Tailwind完全インライン再現
                 ======================================================== */}
              {currentQuizzes[currentIndex].id === 13 && (
                <div className="mt-6 overflow-x-auto max-w-full">
                  <table className="min-w-full border-collapse border border-slate-300 text-sm text-center">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-4 py-2 font-bold text-slate-700 w-32">作業工程</th>
                        <th className="border border-slate-300 px-4 py-2 text-slate-800">A</th>
                        <th className="border border-slate-300 px-4 py-2 text-slate-800">B</th>
                        <th className="border border-slate-300 px-4 py-2 text-slate-800">C</th>
                        <th className="border border-slate-300 px-4 py-2 text-slate-800">D</th>
                        <th className="border border-slate-300 px-4 py-2 text-slate-800">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-4 py-2 bg-slate-50 font-bold text-slate-700">作業時間 [分]</td>
                        <td className="border border-slate-300 px-4 py-2 text-slate-900 font-medium">5</td>
                        <td className="border border-slate-300 px-4 py-2 text-slate-900 font-medium">4</td>
                        <td className="border border-slate-300 px-4 py-2 text-slate-900 font-bold text-red-600">8</td>
                        <td className="border border-slate-300 px-4 py-2 text-slate-900 font-medium">6</td>
                        <td className="border border-slate-300 px-4 py-2 text-slate-900 font-medium">7</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 選択肢ボタン群 */}
            <div className="space-y-3">
              {currentQuizzes[currentIndex].options.map((opt) => {
                const isSelected = selectedAnswer === opt.key;
                const isCorrectKey = opt.key === currentQuizzes[currentIndex].answer;
                
                let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
                if (isAnswered) {
                  if (isCorrectKey) {
                    btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20";
                  } else if (isSelected) {
                    btnStyle = "bg-red-50 border-red-300 text-red-900 ring-2 ring-red-500/20";
                  } else {
                    btnStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                  }
                } else {
                  if (isSelected) btnStyle = "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20";
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswerClick(opt.key)}
                    disabled={isAnswered}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition duration-200 font-medium flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="leading-relaxed">{opt.text}</span>
                    {isAnswered && isCorrectKey && <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                    {isAnswered && isSelected && !isCorrectKey && <X className="w-5 h-5 text-red-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* 解答後のインタラクティブ解説表示ブロック */}
            {isAnswered && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 animate-fadeIn space-y-6">
                
                {/* 判定ヘッダーと要復習連携 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div className="flex items-center space-x-3">
                    {selectedAnswer === currentQuizzes[currentIndex].answer ? (
                      <span className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold">
                        <Check className="w-4 h-4 mr-1" /> 正解
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-red-100 text-red-800 px-4 py-1.5 rounded-full text-sm font-bold">
                        <X className="w-4 h-4 mr-1" /> 不正解
                      </span>
                    )}
                    <span className="text-sm text-slate-500 font-medium">
                      正解番号: <strong className="text-slate-800 text-base">{currentQuizzes[currentIndex].answer}</strong>
                    </span>
                  </div>

                  {/* 要復習スイッチ */}
                  <label className="inline-flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer text-sm select-none transition">
                    <input
                      type="checkbox"
                      checked={userHistory[currentQuizzes[currentIndex].id]?.isReview || false}
                      onChange={toggleReviewFlag}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="flex items-center text-slate-700 font-medium">
                      <Star className={`w-4 h-4 mr-1 ${userHistory[currentQuizzes[currentIndex].id]?.isReview ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                      要復習としてマーク
                    </span>
                  </label>
                </div>

                {/* 解説本文 */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-base border-l-4 border-blue-600 pl-2">
                    解説・重要ポイント
                  </h4>
                  <p className="text-sm font-semibold text-slate-700 bg-blue-50/50 p-3 rounded-lg leading-relaxed">
                    {currentQuizzes[currentIndex].explanation.summary}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {currentQuizzes[currentIndex].explanation.details}
                  </p>

                  {/* 解説内のデータ表再現 (解説補助) */}
                  {currentQuizzes[currentIndex].explanation.tableType === "pqcdsme" && (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border-collapse border border-slate-300 text-xs">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 font-bold w-16">項目</th>
                            <th className="border border-slate-300 p-2 font-bold w-32">要素</th>
                            <th className="border border-slate-300 p-2 font-bold">内容定義</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-slate-300 p-2 text-center font-bold text-red-600">P</td><td className="border border-slate-300 p-2 font-medium">Productivity (生産性)</td><td className="border border-slate-300 p-2 text-slate-600">インプットに対し、アウトプットを可能なかぎり多くすること</td></tr>
                          <tr className="bg-slate-50"><td className="border border-slate-300 p-2 text-center font-bold text-red-600">Q</td><td className="border border-slate-300 p-2 font-medium">Quality (品質)</td><td className="border border-slate-300 p-2 text-slate-600">決められた品質の製品やサービスを提供すること</td></tr>
                          <tr><td className="border border-slate-300 p-2 text-center font-bold text-red-600">C</td><td className="border border-slate-300 p-2 font-medium">Cost (原価)</td><td className="border border-slate-300 p-2 text-slate-600">安いコストで製品やサービスを生産すること</td></tr>
                          <tr className="bg-slate-50"><td className="border border-slate-300 p-2 text-center font-bold text-red-600">D</td><td className="border border-slate-300 p-2 font-medium">Delivery (納期・数量)</td><td className="border border-slate-300 p-2 text-slate-600">決められた納期と数量を守って製品やサービスを提供すること</td></tr>
                          <tr><td className="border border-slate-300 p-2 text-center font-bold text-red-600">S</td><td className="border border-slate-300 p-2 font-medium">Safety (安全性)</td><td className="border border-slate-300 p-2 text-slate-600">安全な環境で作業ができ、さらに安全な製品やサービスを提供すること</td></tr>
                          <tr className="bg-slate-50"><td className="border border-slate-300 p-2 text-center font-bold text-red-600">M</td><td className="border border-slate-300 p-2 font-medium">Morale (意欲・働きがい)</td><td className="border border-slate-300 p-2 text-slate-600">社員の能力開発や向上につとめ、良い職場環境のもと意欲をもって仕事ができること</td></tr>
                          <tr><td className="border border-slate-300 p-2 text-center font-bold text-red-600">E</td><td className="border border-slate-300 p-2 font-medium">Environment (環境性)</td><td className="border border-slate-300 p-2 text-slate-600">環境に負荷をかけない、製品やサービスを提供すること</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {currentQuizzes[currentIndex].explanation.tableType === "3s_5s_ecrs" && (
                    <div className="my-4 space-y-4 text-xs">
                      <div>
                        <div className="font-bold text-slate-800 mb-1">■ 3S (標準化・単純化・専門化)</div>
                        <table className="min-w-full border-collapse border border-slate-300">
                          <tbody>
                            <tr><td className="border border-slate-300 p-2 font-bold w-24 bg-slate-50">標準化</td><td className="border border-slate-300 p-2 text-slate-600">設計や生産方法について標準を設定すること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">単純化</td><td className="border border-slate-300 p-2 text-slate-600">設計や構造、組織、手法などを単純にすること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">専門化</td><td className="border border-slate-300 p-2 text-slate-600">企業や工場、工程が特定の機能に特化すること</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 mb-1">■ 5S (整理・整頓・清掃・清潔・躾)</div>
                        <table className="min-w-full border-collapse border border-slate-300">
                          <tbody>
                            <tr><td className="border border-slate-300 p-2 font-bold w-24 bg-slate-50">整理</td><td className="border border-slate-300 p-2 text-slate-600">必要なものと必要無いものを区別して、必要無いものを捨てること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">整頓</td><td className="border border-slate-300 p-2 text-slate-600">必要なものをすぐに使用できるように、所定の場所に準備しておくこと</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">清掃</td><td className="border border-slate-300 p-2 text-slate-600">汚れを取り除き、綺麗な状態を保つこと</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 mb-1">■ ECRSの原則 (改善の原則 : E→C→R→Sの順で検討)</div>
                        <table className="min-w-full border-collapse border border-slate-300">
                          <tbody>
                            <tr><td className="border border-slate-300 p-2 font-bold w-24 bg-slate-50">E (Eliminate)</td><td className="border border-slate-300 p-2 font-medium w-32">やめる、捨てる</td><td className="border border-slate-300 p-2 text-slate-600">作業内容を見直し、その作業を無くせないかを検討すること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">C (Combine)</td><td className="border border-slate-300 p-2 font-medium bg-slate-50">一緒にする</td><td className="border border-slate-300 p-2 text-slate-600">複数の作業をまとめて一緒に処理することで、業務時間を短くできないか検討すること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">R (Replace)</td><td className="border border-slate-300 p-2 font-medium bg-slate-50">置き換える / 順序変更</td><td className="border border-slate-300 p-2 text-slate-600">作業を別の方法に変更したり順番を入れ替えることで効率化を検討すること</td></tr>
                            <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">S (Simplify)</td><td className="border border-slate-300 p-2 font-medium bg-slate-50">単純化する</td><td className="border border-slate-300 p-2 text-slate-600">作業をもっと簡単なやり方に変更し、同じ結果が生み出せないか検討すること</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {currentQuizzes[currentIndex].explanation.tableType === "production_types" && (
                    <div className="my-4 overflow-x-auto">
                      <div className="font-bold text-slate-800 text-xs mb-1">◆生産形態の特徴マトリクス</div>
                      <table className="min-w-full border-collapse border border-slate-300 text-xs text-center">
                        <thead>
                          <tr className="bg-slate-100 font-bold">
                            <th className="border border-slate-300 p-2">項目</th>
                            <th className="border border-slate-300 p-2">個別生産</th>
                            <th className="border border-slate-300 p-2">ロット生産</th>
                            <th className="border border-slate-300 p-2">連続生産</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">生産量</td><td className="border border-slate-300 p-2">少ない</td><td className="border border-slate-300 p-2">中</td><td className="border border-slate-300 p-2">多い</td></tr>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">品種</td><td className="border border-slate-300 p-2">注文数</td><td className="border border-slate-300 p-2">複数</td><td className="border border-slate-300 p-2">基本的に単一</td></tr>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">タイミング</td><td className="border border-slate-300 p-2">受注生産</td><td className="border border-slate-300 p-2">受注生産 / 見込生産</td><td className="border border-slate-300 p-2">見込生産</td></tr>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">品種・量分類</td><td className="border border-slate-300 p-2">多品種少量生産</td><td className="border border-slate-300 p-2">中品種中量生産</td><td className="border border-slate-300 p-2">少品種多量生産</td></tr>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">設備レイアウト</td><td className="border border-slate-300 p-2 font-medium text-blue-600">機能別レイアウト</td><td className="border border-slate-300 p-2 font-medium text-purple-600">グループ別レイアウト</td><td className="border border-slate-300 p-2 font-medium text-emerald-600">製品別レイアウト</td></tr>
                          <tr><td className="border border-slate-300 p-2 font-bold bg-slate-50">段取り替え</td><td className="border border-slate-300 p-2">多い(注文ごと)</td><td className="border border-slate-300 p-2">中(品種ごと)</td><td className="border border-slate-300 p-2">少ない(切替時のみ)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 各選択肢ごとの詳細ブレイクダウン */}
                  <div className="pt-2 space-y-2.5">
                    {currentQuizzes[currentIndex].explanation.breakdown?.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg text-xs leading-relaxed">
                        <strong className="text-slate-800 block mb-0.5">{item.label}</strong>
                        <span className="text-slate-600">{item.content}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* 次へ進むアクションボタン */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleNextQuiz}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 shadow transition transform active:scale-95"
                  >
                    <span>
                      {currentIndex + 1 < currentQuizzes.length ? "次の問題へ" : "結果を確認する"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* 一時中断ボタン */}
            <div className="flex justify-start">
              <button
                onClick={handleReturnHome}
                className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center space-x-1 transition"
              >
                <Home className="w-4 h-4" />
                <span>ダッシュボードに戻る(進行状況は自動保存されます)</span>
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            D. セッション終了・リザルト画面
           ========================================== */}
        {isAuth && viewMode === "result" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="inline-flex bg-emerald-50 p-4 rounded-full text-emerald-600">
              <Award className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">全問回答お疲れ様でした！</h3>
              <p className="text-sm text-slate-500 mt-1">
                選択したセッションのすべての問題のチェックが完了しました。
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm max-w-xs mx-auto">
              <div className="text-slate-500 font-medium">現在の総着手ユニーク問題数</div>
              <div className="text-3xl font-black text-slate-800 mt-1">
                {Object.keys(userHistory).length} / {MASTER_QUIZZES.length}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setViewMode("start")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow"
              >
                他のモードに挑戦
              </button>
              <button
                onClick={() => setViewMode("history")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition"
              >
                詳細な学習履歴・誤答分析
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            E. 履歴管理・ダッシュボード分析画面（同期対応）
           ========================================== */}
        {isAuth && viewMode === "history" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <span>学習データ分析 & 全問題履歴一覧</span>
              </h2>
              <button
                onClick={() => setViewMode("start")}
                className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
              >
                スタート画面へ
              </button>
            </div>

            {/* Recharts 棒グラフカード */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                問題ごとの累積誤答回数チャート
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" h="100%">
                  <BarChart data={prepareChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }}
                      itemStyle={{ color: "#f87171" }}
                    />
                    <Bar dataKey="誤答回数" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                ※バーが高い問題ほど、過去に繰り返し間違えている苦手な問題です。
              </p>
            </div>

            {/* データテーブル一覧 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">
                全13問の学習状況ステータス
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 w-16">ID</th>
                      <th className="px-6 py-3">問題タイトル</th>
                      <th className="px-6 py-3 w-28 text-center">前回正誤</th>
                      <th className="px-6 py-3 w-28 text-center">要復習</th>
                      <th className="px-6 py-3 w-28 text-center">ミス回数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                    {MASTER_QUIZZES.map((q) => {
                      const hist = userHistory[q.id];
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-4 font-mono text-slate-400">#{q.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{q.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{q.category}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {hist ? (
                              hist.lastResult ? (
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">正解</span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">不正解</span>
                              )
                            ) : (
                              <span className="text-slate-300 text-xs font-normal">未着手</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {hist && hist.isReview ? (
                              <span className="inline-flex items-center text-amber-500 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 text-xs font-bold">
                                <Star className="w-3 h-3 mr-0.5 fill-amber-500" /> 対象
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs font-normal">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                            {hist ? (hist.wrongCount || 0) : 0} 回
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      <footer className="mt-16 bg-slate-900 text-slate-500 text-xs text-center py-6 border-t border-slate-800 leading-relaxed">
        <p>© 2026 スマート問題集 3-1 生産管理と生産方式 Webアプリケーション</p>
        <p className="mt-1 text-slate-600">Tailwind CSS & Cloud Firestore Data Sync System</p>
      </footer>
    </div>
  );
}