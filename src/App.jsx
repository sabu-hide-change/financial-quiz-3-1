// npm install lucide-react recharts firebase
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Check, X, Home, ChevronRight, RefreshCw, BarChart2, BookOpen, User, AlertCircle, Bookmark } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// ==========================================
// CONFIGURATION & INITIALIZATION
// ==========================================
const APP_ID = "QuizApp_001";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// QUIZ DATA
// ==========================================
const QUIZ_DATA = [
  {
    id: 1,
    title: "問題 1 生産管理の定義",
    category: "生産管理と生産方式",
    tags: ["JIS定義", "QCD"],
    question: `生産管理に関する次の文中の、空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群より選べ。

生産管理とは、財・Ａの生産に関する管理活動のことで、管理対象はＢ・調達・生産の3つから構成される。所定の品質・原価・数量および納期で生産するため、人・物・金・Ｃを駆使して、需要予測・生産計画・生産実施・Ｄを行う手続およびその活動である。`,
    options: [
      { key: "ア", text: "Ａ：商品   Ｂ：販売 Ｃ：知識 Ｄ：在庫統制" },
      { key: "イ", text: "Ａ：サービス Ｂ：設計 Ｃ：設備 Ｄ：生産統制" },
      { key: "ウ", text: "Ａ：商品   Ｂ：販売 Ｃ：情報 Ｄ：在庫統制" },
      { key: "エ", text: "Ａ：サービス Ｂ：設計 Ｃ：情報 Ｄ：生産統制" }
    ],
    answer: "エ",
    explanation: `日本産業規格（JIS）では生産管理を「財・サービスの生産に関する管理活動」と定義しています。
備考1. 所定の品質・原価・数量および納期で生産するため、または Q（Quality）・C（Cost）・D（Delivery）に関する最適化を図るため、人、物、金、情報を駆使して、需要予測、生産計画、生産実施、生産統制を行う手続およびその活動。
備考2. 狭義には、生産工程における生産統制を意味し、工程管理ともいう。

もう少し簡単に表現すると、生産管理とは、生産の構成要素である「設計・調達・作業」活動を、QCDの観点から最適化を図る管理活動と言うことができます。
「設計・調達・作業」活動の管理目標となるQCDの水準は、全てが高いことが理想的ですが、実際には、この3つの要素はトレードオフの関係にあります。例えば、高品質を追求すると、コストが上昇したり、納期が遅くなる可能性があります。
よってQCDの管理は、顧客満足が最大となる最適なバランスを目標値として定め、その目標値を達成するためにPDSサイクルを回すことが重要となります。

【選択肢詳細】
Ａ：サービス
商品には、販売を目的とする財およびサービスの両方が含まれます。「財」は既に記載されていますから、この選択肢には「サービス」を入れるのが適切です。
Ｂ：設計
販売は生産活動ではないため、選択肢としては不適切です。
Ｃ：情報
企業の経営資源は、人・もの・金・情報で定義されます。選択肢の「設備」と「知識」は、それぞれ「モノ」と「情報」に含まれますから、選択肢としては不適切となります。
Ｄ：生産統制
在庫の統制や管理は、生産統制の一部です。よって生産統制の方が選択肢としては、より適切となります。`
  },
  {
    id: 2,
    title: "問題 2 生産の管理目標",
    category: "生産管理と生産方式",
    tags: ["PQCDSME"],
    question: `生産における管理目標（P,Q,C,D,S,M,E)の記号と活動例の組み合わせとして、最も適切なものはどれか。`,
    options: [
      { key: "ア", text: "P－購買部門では、材料を安く購入するため複数のサプライヤーから見積もりを入手する。" },
      { key: "イ", text: "D－生産管理部門では、納期を守るため資材の在庫状況や作業の進捗状況を定期的に確認する。" },
      { key: "ウ", text: "C－品質部門では、出荷前に製品に異常がないか検査を行う。" },
      { key: "エ", text: "S-設計部門では、前モデルに対して消費電力が50%少なくなるように新製品を開発した。" }
    ],
    answer: "イ",
    explanation: `生産現場における7つの管理目標である、PQCDSMEの内容を問われています。
【PQCDSME一覧】
・P (Productivity: 生産性): インプットに対し、アウトプットを可能なかぎり多くすること
・Q (Quality: 品質): 決められた品質の製品やサービスを提供すること
・C (Cost: 原価): 安いコストで製品やサービスを生産すること
・D (Delivery: 納期・数量): 決められた納期と数量を守って製品やサービスを提供すること
・S (Safety: 安全性): 安全な環境で作業ができ、さらに安全な製品やサービスを提供すること
・M (Morale: 意欲・働きがい): 社員の能力開発や向上につとめ、良い職場環境のもと意欲をもって仕事ができること
・E (Environment/Ecology: 環境性): 環境に負荷をかけない、製品やサービスを提供すること

【選択肢詳細】
ア ×：安価で材料を購入する活動は、原価に関するものですから Cost に該当します。P は生産性に関する活動ですから、記述は不適切です。
イ ◯：資材や製品の運搬・停滞・保管などの状況を管理する現品管理や、作業の進捗管理は、納期を守るための活動ですから Delivery に該当します。また、作業負荷と生産能力のバランス調整をとる余力管理も Delivery 活動の一つです。よって記述は適切です。
ウ ×：品質をチェックする出荷検査は、品質を維持するための活動ですから Quality に該当します。C はコストに関する活動ですから、記述は不適切です。
エ ×：消費電力が少なくなるような活動は、環境に配慮した活動ですから Environment に該当します。S は安全性に関する活動ですから、記述は不適切です。`
  },
  {
    id: 3,
    title: "問題 3 生産効率化の原則",
    category: "生産管理と生産方式",
    tags: ["3S", "5S", "ECRS"],
    question: `生産を効率化し、生産性を高めるためには、幾つかの原則がある。これらの原則の説明として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "ネジの締め付け工程を、手作業から電動ドライバを用いる方法に変更することで作業時間を短縮した。この内容は、ECRSの原則のRを適用したことになる。" },
      { key: "イ", text: "電話応対に関するルールを決めて、全社員がこれを徹底することにした。この内容は5Sの原則の躾を適用したことになる。" },
      { key: "ウ", text: "作業者によって、品質や作業時間に大きなばらつきが生じないように、作業手順を書類にした。この内容は3Sの原則の標準化を適用したことになる。" },
      { key: "エ", text: "工場の部品棚に保管していた部品の中で、古くて使う予定がないものを廃棄した。この内容は5Sの原則の整頓を適用したことになる。" },
      { key: "オ", text: "同じ顧客へ送る荷物を一つに纏めることで、送料を下げることが出来た。この内容は、ECRSの原則のCを適用したことになる。" }
    ],
    answer: "エ",
    explanation: `【生産の効率化の原則概要】
●3S：標準化(Standardization)、単純化(Simplification)、専門化(Specialization)
●5S：整理（要るものと要らないものを分け要らないものを捨てる）、整頓（必要なものをすぐに使えるよう所定の場所に準備する）、清掃、清潔、躾（決められたルールを必ず守る）
●ECRS：E(Eliminate: やめる)、C(Combine: 一緒にする)、R(Replace/Rearrange: 置き換える/順番を変える)、S(Simplify: 単純化する)

【選択肢詳細】
ア ◯：ネジを締める作業を別の方法（手作業→電動ドライバ）に置き換えています。ECRSの原則では置き換え（Replace)に該当します。（※固定方法をネジから接着に変更して時間を短縮したのであれば単純化(Simplify)となります）
イ ◯：決めたルールを全員で守るようにすることは、5Sの原則では躾に該当します。（※このルールをファイルに綴じて、誰でも直ぐに確認できる場所に置いたのであれば整頓となります）
ウ ◯：品質や作業時間にバラツキが生じないように、作業手順を書類にしたものを「作業標準書」と呼びます。3Sの原則では標準化（Standardization)に該当します。
エ ×：古くて使う予定のないネジを廃棄するのは、要らないものを処分していることになりますから、5Sの原則では「整理」に該当します。よって「整頓」とした本肢の記述は不適切です。（※棚の部品を種類別に並べ替えて、直ぐに取り出せるようにしたのであれば整頓となります）
オ ◯：複数の荷物を一つに纏めることで、送料を削減（改善）しているので、ECRSの原則ではC（Combine)に該当します。`
  },
  {
    id: 4,
    title: "問題 4 生産効率化",
    category: "生産管理と生産方式",
    tags: ["生産性", "稼働率", "歩留り", "リードタイム"],
    question: `生産の効率化に関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "生産性は、産出された量に対する投入した量の比率で求めることができる。" },
      { key: "イ", text: "稼働率は、人または機械の利用可能時間に対する有効稼働時間との比率である。" },
      { key: "ウ", text: "歩留りは、投入された主原材料の量とその主原材料から実際に産出された品物の量との比率である。" },
      { key: "エ", text: "生産リードタイムは、生産を着手してから出荷できる状態になるまでの時間を指し、工程間で滞留していた時間も生産リードタイムに含まれる。" }
    ],
    answer: "ア",
    explanation: `【生産効率化に関する重要用語】
・生産性 ＝ 産出量(Output) ／ 投入量(Input)
・稼働率：就業時間・利用可能時間に対する、有効稼働時間（生産に直接役立っている時間）の比率。
・生産リードタイム：生産の着手時期から完了時期（出荷できる状態になるまで）にいたる時間。複数工程の場合、工程間の滞留時間も含まれる。
・歩留り：投入された主原材料の量と、実際に産出された良品（品物）の量との比率。材料をいかに無駄なく有効に使ったかを表す。

【選択肢詳細】
ア ×：生産性は「産出量 ÷ 投入量」で求めます。「投入された量に対する産出した量の比率」は分母と分子が逆（本肢の表現だと投入量÷産出量になってしまう）であるため、不適切です。
イ ◯：稼働率の適切な説明です。
ウ ◯：歩留りの適切な説明です。
エ ◯：生産リードタイムの適切な説明です。工程間の滞留時間も含まれます。`
  },
  {
    id: 5,
    title: "問題 5 自主管理活動",
    category: "生産管理と生産方式",
    tags: ["QCサークル", "小集団活動"],
    question: `自主管理活動に関する記述として、最も適切なものはどれか。`,
    options: [
      { key: "ア", text: "組織において、トップダウンの命令系統を重視した活動である。" },
      { key: "イ", text: "QCサークルは自発的に集まった仲間でグループを構成して、会社の品質に関する問題の解決にあたる活動である。" },
      { key: "ウ", text: "活動を行う目的の一つとして、従業員の自発性を高めることがある。" },
      { key: "エ", text: "QCサークルは品質（Q）とコスト（C）を中心に改善を行う自主管理活動である。" }
    ],
    answer: "ウ",
    explanation: `自主管理活動は、現場の従業員が自主性を発揮して行う小集団活動のことです。従業員の自主性を重視し、能力や創意工夫を引き出すことが目的です。経営者が強制・命令するトップダウン活動ではありません。

【選択肢詳細】
ア ×：トップからの命令ではなく従業員の自発性を重視した活動です。トップ層の役割は命令ではなく支援です。
イ ×：QCの小集団（サークル）は、自発的に集まった仲間ではなく「同じ職場や同じ業務をするグループ」で構成するのが一般的です。
ウ ◯：小集団活動においては、従業員の自主性を重んじて、自発性が高まるようにすることが最も重要な目的の一つとなります。
エ ×：QCサークルは「Quality Control」の略であり、主に業務や製品の「品質（Q）の向上」を対象とする活動です。コスト（C）を中心とするものではありません。`
  },
  {
    id: 6,
    title: "問題 6 受注生産と見込生産",
    category: "生産管理と生産方式",
    tags: ["生産形態", "納期", "需要予測"],
    question: `受注生産と見込生産に関する説明として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "受注生産には、個別受注生産と繰返し受注生産がある。" },
      { key: "イ", text: "受注生産は、生産リードタイムの短縮や受注の平準化が重点課題となる。" },
      { key: "ウ", text: "見込生産は、需要量を予測して製品を作り、その作った製品は注文を受けてから販売するため、顧客が注文してからの納期が長くなる。" },
      { key: "エ", text: "見込生産は、需要の予測精度を高めることや、需要変動に柔軟に対応できる生産体制の確立が重点課題となる。" }
    ],
    answer: "ウ",
    explanation: `【受注生産と見込生産の特徴】
●受注生産（注文を受けてから生産開始）
・個別受注生産（毎回設計から行う）と繰返し受注生産（設計は事前、注文後に生産）がある。
・重点課題：生産リードタイムの短縮、納期遵守、受注の平準化（工場の操業度を高く保つため）。
●見込生産（需要予測に基づきあらかじめ生産・在庫化）
・注文を受けた際は在庫から即座に販売するため、注文後の納期は短くなります。
・重点課題：需要予測精度の向上（過剰在庫や機会損失の削減）、需要変動に柔軟に対応できる生産体制の構築。

【選択肢詳細】
ア ◯：適切な記述です。
イ ◯：適切な記述です。
ウ ×：見込生産では既製品の在庫から引き渡すため、顧客が注文してからの納期は「短く」なります。「長くなる」とした本肢は不適切です。
エ ◯：適切な記述です。`
  },
  {
    id: 7,
    title: "問題 7 生産形態の分類",
    category: "生産管理と生産方式",
    tags: ["レイアウト", "個別・ロット・連続"],
    question: `製品の生産は、その種類と量によって、適した生産形態やレイアウトが選択される。次の組み合わせで、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "連続生産 － 少品種多量生産 － 製品別レイアウト" },
      { key: "イ", text: "ロット生産 － 見込生産 － グループ別レイアウト" },
      { key: "ウ", text: "個別生産 － 多品種少量生産 － 機能別レイアウト" },
      { key: "エ", text: "連続生産 － 受注生産 － 製品別レイアウト" },
      { key: "オ", text: "ロット生産 － 中品種中量生産 － グループ別レイアウト" }
    ],
    answer: "エ",
    explanation: `【生産形態の分類と関連性】
・個別生産：個別のオーダー（受注生産）。多品種少量生産。柔軟な対応ができるよう「機能別（工程別）レイアウト」を採用。段取りは注文ごとに多く発生。
・ロット生産：一定量（ロット）ずつまとめて生産。受注・見込の双方。中品種中量生産。段取り替えのロスを抑えるため「グループ別レイアウト」を採用。
・連続生産：同じ製品を続けて大量生産（見込生産）。少品種多量生産。効率を重視し、専用ラインを設ける「製品別レイアウト」を採用。段取りは品種切替時のみで少ない。

【選択肢詳細】
ア ◯：連続生産、少品種多量、製品別レイアウトは強い関連があり適切です。
イ ◯：ロット生産は見込生産にも用いられ、グループ別レイアウトとの相性も良いです。
ウ ◯：個別生産、多品種少量、機能別レイアウトは整合しています。
エ ×：連続生産は専用ラインで大量に流し続ける形態のため、通常は需要予測に基づく「見込生産」で行われます。個別注文に応じる「受注生産」と組み合わせるのは一般的ではないため、不適切です。
オ ◯：ロット生産は中品種中量生産に最も適しており、グループ別レイアウトと適合します。`
  },
  {
    id: 8,
    title: "問題 8 段取り",
    category: "生産管理と生産方式",
    tags: ["内段取り", "外段取り", "シングル段取り"],
    question: `生産効率やライン稼働率を向上するために重要な段取りに関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "ロット生産において、まとめ生産の量が減少すると、段取り頻度は減る傾向にある。" },
      { key: "イ", text: "設備の稼働率を高めるために、内段取りを外段取りに変更した。" },
      { key: "ウ", text: "生産効率を上げるため、生産計画を立てる際に、同一工程で生産する別の製品を続けて生産することを検討した。" },
      { key: "エ", text: "段取り時間を短縮して10分未満にすることを、シングル段取りと呼ぶ。" }
    ],
    answer: "ア",
    explanation: `【段取りの重要キーワード】
・内段取り：生産ライン内で、設備・機械を停止させて行う段取り作業（稼働率が下がる）。
・外段取り：生産ラインの外で、設備を動かしたまま予め準備しておく段取り作業（停止時間を短縮できる）。
・効率の順：ゼロ段取り（3分未満） ＞ シングル段取り（10分未満） ＞ 外段取り ＞ 内段取り
・流し方による頻度：個別生産（多：原則注文ごと） ＞ ロット生産（中） ＞ 連続生産（少）

【選択肢詳細】
ア ×：ロット生産において「まとめ生産の量（ロットサイズ）」が減少するということは、同じ量を生産する場合に何度も品種を切り替える必要があることを意味します。したがって、段取りの頻度は「増える」ことになるため、本肢は不適切です。
イ ◯：機械を止める内段取りから、止めずに外で準備する外段取りへ移行させることは、設備稼働率を高めるための王道の改善策です。
ウ ◯：同一工程で生産できる製品を連続してスケジュールすれば、段取り替えの作業自体を最小限に抑えられます。
エ ◯：10分未満（時間が一桁＝シングル）に短縮することをシングル段取りと呼びます。`
  },
  {
    id: 9,
    title: "問題 9 生産方式",
    category: "生産管理と生産方式",
    tags: ["ライン生産", "セル生産", "仕掛品"],
    question: `生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "ライン生産方式からセル生産方式に変更するため、類似の加工物をグループ化し、機械の配置を見直した。" },
      { key: "イ", text: "ライン方式は、セル生産方式と比べて作業者の育成に時間がかかる。" },
      { key: "ウ", text: "ラインバランシングを向上するため、ライン生産方式からセル生産方式に切替えた。" },
      { key: "エ", text: "工程間の仕掛品をなくすため、ライン生産方式からセル生産方式（1人生産方式）に変更した。" }
    ],
    answer: "イ",
    explanation: `【ライン生産方式とセル生産方式の比較】
●ライン生産方式（流れ作業）
・少品種多量生産向き。作業者は1つの工程に特化する「単能工」のため、育成は短期間で済みます。ただし、工程間のバランス（ラインバランシング）が悪いと手待ちや仕掛品が発生します。
●セル生産方式（グループ編成、U字ラインや1人生産）
・多品種少量生産向き。類似した部品・工程をグループ化（グループテクノロジー）して配置。作業者が複数の工程をこなす「多能工」となるため、作業者の育成には多くの時間がかかります。

【選択肢詳細】
ア ◯：セル生産方式の導入（グループテクノロジーの適用と配置見直し）として適切な記述です。
イ ×：ライン生産方式は単一の作業に特化（単能工）するため、短期間で習得可能です。一方、セル生産方式は多くの工程を担当する多能工化が必要なため、育成に時間がかかります。したがって、「ライン方式の方が育成に時間がかかる」とした本肢は誤りです。
ウ ◯：セル生産方式（特に1人や少数の多能工による対応）では、1人で複数工程を連続して行うため工程間の待ち時間が極めて少なく、バランスロス率を下げられます。
エ ◯：1人生産方式では、1人の作業者が最初から最後まで一貫して作業を行うため、工程間という概念自体がなくなり、仕掛品が基本的に発生しません。`
  },
  {
    id: 10,
    title: "問題 10 セル生産方式",
    category: "生産管理と生産方式",
    tags: ["U字ライン", "1人生産", "多能工"],
    question: `セル生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "セル生産方式は、主にU字ライン方式と1人生産方式がある。" },
      { key: "イ", text: "セル生産方式は、うまく導入すればバランスロスが少なくなり、仕掛品在庫を削減して、生産性を高めることができる。" },
      { key: "ウ", text: "U字ライン方式では、作業者が1人で複数の工程を担当するため、短期間で作業を修得できるといったメリットがある。" },
      { key: "エ", text: "1人生産方式では、1人で最初から最後までの作業を行うため、基本的に工程間の仕掛品が発生しないといったメリットがある。" }
    ],
    answer: "ウ",
    explanation: `セル生産方式は、製品・部品を類似性に基づいてグループ化（グループテクノロジー）して生産を編成する方式です。代表的な形態として「U字ライン方式」と「1人生産方式」があります。

【代表的な形態の特徴】
●U字ライン方式：作業者が動きやすいよう工程をU字型に配置。1人で複数工程を担当。工程間の待ち時間を減らせるが、多能工前提のため作業習熟に時間がかかる。
●1人生産方式：1人で全工程を受け持つ。仕掛品が発生せず、自分のペースで作業できる。一方で生産量が個人の能力に依存し、全工程をマスターするため習熟に多くの時間が必要。

【選択肢詳細】
ア ◯：適切な記述です。
イ ◯：多能工化により工程間の手待ち（バランスロス）や仕掛品を大きく削減できます。
ウ ×：U字ライン方式をはじめとするセル生産方式は、1人が広範囲の複数工程を担当する「多能工」を前提とするため、作業が習熟するまでに「多くの時間がかかる（デメリット）」のが特徴です。「短期間で修得できる」とした本肢は不適切です。
エ ◯：1人生産方式の大きなメリットの1つであり、適切な記述です。`
  },
  {
    id: 11,
    title: "問題 11 ライン生産方式",
    category: "生産管理と生産方式",
    tags: ["単能工", "レイアウト制約", "生産分類"],
    question: `ライン生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "ライン生産方式は、単能工で作業を行うため生産性が高く、管理しやすいことがメリットである。" },
      { key: "イ", text: "ライン生産方式は、製品や生産量の変化に柔軟に対応しにくい点がデメリットである。" },
      { key: "ウ", text: "ライン生産方式は、生産計画を変更した場合にレイアウトを柔軟に変更しやすいというメリットがある。" },
      { key: "エ", text: "ライン生産方式には、特定の単一品種を連続して生産する方式と、同じラインで複数の品種を生産する方式がある。" }
    ],
    answer: "ウ",
    explanation: `ライン生産方式は、ベルトコンベアなどの流れ作業による生産で、連続生産（見込生産）に多く用いられます。

【ライン生産の特徴】
・メリット：連続生産による高い生産性、単一作業による管理のしやすさ、単能工対応（個人の技量に依存しにくい）。
・デメリット：仕様変更や数量変動への柔軟性の低さ、設備レイアウトの制約の大きさ（一度ラインを組むと変更が困難）、単調作業によるモチベーション低下。
【ラインの分類】
・単一品種ライン：特定の1品種を流し続ける。
・多品種ライン：同じラインに複数品種を流す。「ライン切り換え方式（期間ごとに切り替え・段取り発生）」と「混合ライン方式（加工が類似する品種を混流・段取りなし）」がある。

【選択肢詳細】
ア ◯：メリットとして適切な内容です。
イ ◯：デメリットとして適切な内容です。
ウ ×：ライン生産方式は専用の設備が固定配置されるため、「設備レイアウトの制約が大きく、柔軟に変更しにくい」のが大きなデメリットです。計画変更に合わせて柔軟にレイアウトや人員を変えられるのは「セル生産方式」のメリットです。したがって本肢は不適切です。
エ ◯：分類（単一品種ライン、多品種ライン）に関する適切な説明です。`
  },
  {
    id: 12,
    title: "問題 12 ラインバランシング",
    category: "生産管理と生産方式",
    tags: ["ピッチダイアグラム", "サイクルタイム"],
    question: `ラインバランシングに関する記述として、最も不適切なものはどれか。`,
    options: [
      { key: "ア", text: "ラインバランシングとは、生産ライン上の各工程の作業時間をなるべく均一にすることを指す。" },
      { key: "イ", text: "ピッチダイアグラムでは、各作業ステーションを横軸に取り、作業時間を縦軸で表す。" },
      { key: "ウ", text: "生産ラインに資材を投入する時間間隔をサイクルタイムという。" },
      { key: "エ", text: "サイクルタイムは、最も作業時間が短い作業ステーションの作業時間と同じになる。" }
    ],
    answer: "エ",
    explanation: `【ラインバランシングと関連用語】
・ラインバランシング：生産ライン上の各工程（作業ステーション）の作業時間を均一化し、ムダ（手待ち・仕掛品）をなくす取り組み。
・ピッチダイアグラム：各ステーションを横軸、作業時間を縦軸にとってばらつきを可視化する棒グラフ。
・サイクルタイム（ピッチタイム）：生産ラインに資材を投入する時間間隔（または製品が1個完成して出てくる時間間隔）。ライン全体の生産速度を決定づけるもので、生産ラインの中で「最も作業時間が長い（ボトルネック）工程の作業時間」と等しくなります。

【選択肢詳細】
ア ◯：ラインバランシングの定義として適切です。
イ ◯：ピッチダイアグラムの構成方法として適切です。
ウ ◯：サイクルタイム（ピッチタイム）の定義として適切です。
エ ×：サイクルタイムは、最も作業時間が「長い」ステーションの作業時間と同じになります（一番遅い工程に引っ張られるため）。「短い」とした本肢は不適切です。`
  },
  {
    id: 13,
    title: "問題 13 ライン編成効率",
    category: "生産管理と生産方式",
    tags: ["計算問題", "ライン編成効率", "バランスロス"],
    question: `次の表に示される生産ラインがある。このラインの記述に関して、最も適切なものはどれか。

【作業工程と作業時間】
| 作業工程 | A | B | C | D | E |
|---|---|---|---|---|---|
| 作業時間 [分] | 5 | 4 | 8 | 6 | 7 |`,
    options: [
      { key: "ア", text: "このラインのライン編成効率は、80%である。" },
      { key: "イ", text: "作業工程Bの手前では手待ちが発生し、作業工程Eの手前では仕掛品の数が最も多くなる。" },
      { key: "ウ", text: "全ての工程の作業負荷を均一にしたところ、生産性が25%改善した。" },
      { key: "エ", text: "作業工程を一つ追加して、ラインバランスを見直すことで、サイクルタイム数を最大で4分まで短縮できる。" }
    ],
    answer: "ウ",
    explanation: `【データ分析・計算】
各工程の作業時間：A=5分, B=4分, C=8分, D=6分, E=7分
・作業ステーション数 (N) ＝ 5
・作業時間の合計 (Σt) ＝ 5 + 4 + 8 + 6 + 7 ＝ 30分
・ボトルネック工程 ＝ C（8分） ⇒ 現状のサイクルタイム (CT) ＝ 8分

●ライン編成効率の計算式：
ライン編成効率 ＝ 作業時間の合計 ／ (サイクルタイム × 作業ステーション数)
現状 ＝ 30分 ／ (8分 × 5) ＝ 30 ／ 40 ＝ 75％
●バランスロス率 ＝ 100% － ライン編成効率 ＝ 25%

【選択肢詳細】
ア ×：計算の通り、現状のライン編成効率は「75%」です（80%ではありません）。
イ ×：手前の工程が長く後ろが短いときは手待ち、手前が短く後ろが長いときは仕掛品が発生します。また、時間差が最も大きい箇所でそのムダも最大になります。
・A(5分) → B(4分) ：手前が長いため、Bの手前で「手待ち」が発生（最大）。前半の記述は正しいです。
・B(4分) → C(8分) ：手前が短いため、Cの手前で「仕掛品」が発生（最大、差が4分）。仕掛品が最大になるのはCの手前であるため、後半の「Eの手前で仕掛品が最も多くなる」は誤りです。
ウ ◯：すべての作業負荷を完全に均一（ライン編成効率100%）にすると、ボトルネックがなくなり理想のサイクルタイムは「30分÷5工程＝6分」になります。
生産スピードは 1/CT で表されるため、
現状の速度(1/8)から均一化後の速度(1/6)への改善率は、
(1/6) ／ (1/8) ＝ 8 ／ 6 ＝ 1.333...（約33%のスピード向上）
一方、「生産性（編成効率）」の観点で見ると、現状の効率75%から100%へ高まるため、効率ベースで「25%改善（100% - 75%）」したと捉えることができます。よって記述として適切です。
エ ×：総作業時間30分は変わらないため、工程を1つ増やして計6工程にしても、均等配分した際の限界サイクルタイムは「30分 ÷ 6工程 ＝ 5分」が限界です。4分まで短縮することは不可能です。`
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Authentication & State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // App Modes: 'start' | 'quiz' | 'review_list' | 'analytics'
  const [appMode, setAppMode] = useState('start');
  
  // Quiz Filter Mode: 'all' | 'wrong' | 'review'
  const [quizFilter, setQuizFilter] = useState('all');
  
  // Current Quiz State
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // User Progress Data (Synced with Firestore)
  const [wrongQuestions, setWrongQuestions] = useState([]); // Array of IDs
  const [reviewQuestions, setReviewQuestions] = useState([]); // Array of IDs
  const [historyLog, setHistoryLog] = useState({}); // { id: { total: 0, correct: 0 } }
  
  // Interrupted Resume State
  const [resumeData, setResumeData] = useState(null);

  // ------------------------------------------
  // Anonymous Sign-In on Mount
  // ------------------------------------------
  useEffect(() => {
    async function initAuth() {
      try {
        console.log("Executing anonymous Firebase sign-in...");
        await signInAnonymously(auth);
        console.log("Firebase anonymous authentication successful.");
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    }
    initAuth();
  }, []);

  // ------------------------------------------
  // Data Fetching & Sync
  // ------------------------------------------
  const handleConnect = async (e) => {
    e.preventDefault();
    if (!authKey.trim()) return;
    
    setLoading(true);
    const cleanedKey = authKey.trim();
    setUserId(cleanedKey);
    console.log(`Loading data for user session: ${cleanedKey}`);

    try {
      const docRef = doc(db, APP_ID, cleanedKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("User data retrieved successfully:", data);
        
        setWrongQuestions(data.wrongQuestions || []);
        setReviewQuestions(data.reviewQuestions || []);
        setHistoryLog(data.historyLog || {});
        
        // Check for active progress session
        if (typeof data.progressIndex === 'number' && data.progressMode) {
          console.log(`Active progress session found: Index ${data.progressIndex}, Mode: ${data.progressMode}`);
          setResumeData({
            index: data.progressIndex,
            mode: data.progressMode
          });
        } else {
          setResumeData(null);
        }
      } else {
        console.log("No existing user session profile. Initializing cloud profile...");
        await setDoc(docRef, {
          wrongQuestions: [],
          reviewQuestions: [],
          historyLog: {},
          createdAt: new Date().toISOString()
        });
        setWrongQuestions([]);
        setReviewQuestions([]);
        setHistoryLog({});
        setResumeData(null);
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Cloud database synchronization failed:", error);
      alert("同期に失敗しました。オフラインモード（ローカル保存）で続行します。");
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to persist master sync data state
  const saveCloudState = async (updates) => {
    if (!userId) return;
    try {
      const docRef = doc(db, APP_ID, userId);
      await updateDoc(docRef, updates);
      console.log("Cloud update synchronized successfully.", updates);
    } catch (error) {
      console.error("Error committing synchronized updates:", error);
    }
  };

  // ------------------------------------------
  // Quiz Lifecycle Engine
  // ------------------------------------------
  const buildQuizSessionList = (mode) => {
    let list = [];
    if (mode === 'all') {
      list = [...QUIZ_DATA];
    } else if (mode === 'wrong') {
      list = QUIZ_DATA.filter(q => wrongQuestions.includes(q.id));
    } else if (mode === 'review') {
      list = QUIZ_DATA.filter(q => reviewQuestions.includes(q.id));
    }
    return list;
  };

  const startNewQuizSession = (mode, forceStartIndex = null) => {
    console.log(`Starting session sequence. Mode: ${mode}, Forced Index: ${forceStartIndex}`);
    const questions = buildQuizSessionList(mode);
    
    if (questions.length === 0) {
      alert("選択されたモードの対象問題が存在しません。");
      return;
    }

    setQuizFilter(mode);
    setFilteredQuizzes(questions);
    
    const startIndex = forceStartIndex !== null ? forceStartIndex : 0;
    setCurrentQuizIndex(startIndex);
    setSelectedOption(null);
    setIsAnswered(false);
    setAppMode('quiz');

    // If starting from scratch, reset progress fields
    if (forceStartIndex === null) {
      saveCloudState({
        progressIndex: 0,
        progressMode: mode
      });
    }
  };

  const handleSelectOption = (optionKey) => {
    if (isAnswered) return;
    setSelectedOption(optionKey);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return;
    setIsAnswered(true);

    const currentQuiz = filteredQuizzes[currentQuizIndex];
    const isCorrect = selectedOption === currentQuiz.answer;
    
    console.log(`Answer selected: ${selectedOption}. Correct: ${isCorrect}`);

    // Update History Metrics
    const updatedHistory = { ...historyLog };
    if (!updatedHistory[currentQuiz.id]) {
      updatedHistory[currentQuiz.id] = { total: 0, correct: 0 };
    }
    updatedHistory[currentQuiz.id].total += 1;
    if (isCorrect) updatedHistory[currentQuiz.id].correct += 1;
    setHistoryLog(updatedHistory);

    // Update Wrong Question Tracker
    let updatedWrongs = [...wrongQuestions];
    if (!isCorrect && !updatedWrongs.includes(currentQuiz.id)) {
      updatedWrongs.push(currentQuiz.id);
    } else if (isCorrect && updatedWrongs.includes(currentQuiz.id)) {
      updatedWrongs = updatedWrongs.filter(id => id !== currentQuiz.id);
    }
    setWrongQuestions(updatedWrongs);

    // Sync state with cloud session tracking
    saveCloudState({
      historyLog: updatedHistory,
      wrongQuestions: updatedWrongs,
      progressIndex: currentQuizIndex,
      progressMode: quizFilter
    });
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuizIndex + 1;
    if (nextIndex < filteredQuizzes.length) {
      setCurrentQuizIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
      
      saveCloudState({
        progressIndex: nextIndex
      });
    } else {
      // Completed full workflow session path
      console.log("Quiz session completed. Tearing down progress state markers.");
      alert("すべての問題を解き終えました！お疲れ様でした。");
      setAppMode('start');
      setResumeData(null);
      saveCloudState({
        progressIndex: 0,
        progressMode: null
      });
    }
  };

  const handleToggleReviewFlag = (quizId) => {
    let updatedReviews = [...reviewQuestions];
    if (updatedReviews.includes(quizId)) {
      updatedReviews = updatedReviews.filter(id => id !== quizId);
    } else {
      updatedReviews.push(quizId);
    }
    setReviewQuestions(updatedReviews);
    saveCloudState({ reviewQuestions: updatedReviews });
  };

  const handleAbandonSession = () => {
    console.log(`Abandoning current position tracking state at index: ${currentQuizIndex}`);
    setAppMode('start');
    // Refresh resume data view window flag
    setResumeData({
      index: currentQuizIndex,
      mode: quizFilter
    });
  };

  // ------------------------------------------
  // Analytics Calculations
  // ------------------------------------------
  const getAnalyticsDataset = () => {
    return QUIZ_DATA.map(q => {
      const stats = historyLog[q.id] || { total: 0, correct: 0 };
      const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return {
        name: `問${q.id}`,
        "正解率(%)": rate,
        "解答回数": stats.total
      };
    });
  };

  // ==========================================
  // RENDER INTERFACES
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center border border-slate-100">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">クラウド同期中</h3>
          <p className="text-sm text-slate-500">データを同期しています。少々お待ちください...</p>
        </div>
      </div>
    );
  }

  // Gateway Access UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-xl text-blue-700 mb-3">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">中小企業診断士 スマート問題集</h1>
            <p className="text-sm text-slate-500 mt-1">3-1 生産管理と生産方式</p>
          </div>

          <form onSubmit={handleConnect} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ユーザー識別コード / 合言葉
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  placeholder="例: my-study-token-2026"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                ※同じ合言葉を入力すると、PCやスマホ間で学習進捗・復習フラグを完全に同期できます。
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              学習を開始する
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Universal Sticky Header Frame */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setAppMode('start')}>
            <div className="p-2 bg-blue-600 rounded-lg text-white font-bold text-sm tracking-wider">DX</div>
            <div>
              <span className="font-bold text-slate-950 block text-sm leading-tight">スマート問題集</span>
              <span className="text-xs text-slate-500">Session Sync: {userId}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setAppMode('start')}
              className={`p-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors ${appMode === 'start' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">ホーム</span>
            </button>
            <button 
              onClick={() => setAppMode('review_list')}
              className={`p-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors ${appMode === 'review_list' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">要復習リスト</span>
            </button>
            <button 
              onClick={() => setAppMode('analytics')}
              className={`p-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors ${appMode === 'analytics' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">データ分析</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Layout Wrapper Target */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* VIEW ENGINE: START SCREEN */}
        {appMode === 'start' && (
          <div className="space-y-8">
            
            {/* Context Interrupted Session Alert Banner */}
            {resumeData && resumeData.index > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-base">前回の学習データが見つかりました</h4>
                    <p className="text-sm text-amber-700 mt-0.5">
                      前回は【{resumeData.mode === 'all' ? 'すべての問題' : resumeData.mode === 'wrong' ? '前回不正解の問題' : '要復習の問題'}】の
                      <span className="font-bold mx-1">問題 {resumeData.index + 1}</span>まで進んでいます。続きから再開しますか？
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => startNewQuizSession(resumeData.mode, resumeData.index)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    続きから再開する
                  </button>
                  <button
                    onClick={() => {
                      setResumeData(null);
                      saveCloudState({ progressIndex: 0, progressMode: null });
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    最初から
                  </button>
                </div>
              </div>
            )}

            {/* Title Billboard Hero section */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white shadow-lg">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30">
                運営管理：技術・情報管理
              </span>
              <h2 className="text-3xl font-extrabold mt-3 tracking-tight">3-1 生産管理と生産方式</h2>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                JIS定義、PQCDSMEなどの基礎理論から、ロット生産、セル生産方式、ラインバランシング等の計算指標まで、中小企業診断士試験の最頻出項目を完全網羅。
              </p>
            </div>

            {/* Mode Select Router Matrix */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">学習モードを選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-500 transition-all group">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">すべての問題</h4>
                    <p className="text-sm text-slate-500 mt-2">全 {QUIZ_DATA.length} 問の完全データセットを網羅して体系的に学習します。</p>
                  </div>
                  <button 
                    onClick={() => startNewQuizSession('all')}
                    className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold tracking-wide transition-colors"
                  >
                    演習を開始する
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-red-500 transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition-colors">前回不正解のみ</h4>
                      <span className="bg-red-50 text-red-600 font-bold text-xs px-2.5 py-1 rounded-full border border-red-100">
                        {wrongQuestions.length} 問
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">過去のセッションで間違えた問題だけを抽出し、弱点を克服します。</p>
                  </div>
                  <button 
                    onClick={() => startNewQuizSession('wrong')}
                    disabled={wrongQuestions.length === 0}
                    className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-sm font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
                  >
                    弱点補強を始める
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-amber-500 transition-all group">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">要復習の問題のみ</h4>
                      <span className="bg-amber-50 text-amber-600 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-100">
                        {reviewQuestions.length} 問
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">自分でチェックを付けた要マーク問題を対象に、重点的な反復訓練を行います。</p>
                  </div>
                  <button 
                    onClick={() => startNewQuizSession('review')}
                    disabled={reviewQuestions.length === 0}
                    className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
                  >
                    復習を開始する
                  </button>
                </div>

              </div>
            </div>

            {/* Quick Metrics Dashboard Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-base">総合進捗ステータス</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-500 block font-medium">総問題数</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">{QUIZ_DATA.length}</span>
                </div>
                <div className="p-4 bg-blue-50 text-blue-900 rounded-xl">
                  <span className="text-xs text-blue-600 block font-medium">解答経験あり</span>
                  <span className="text-2xl font-black mt-1 block">
                    {Object.keys(historyLog).length}
                  </span>
                </div>
                <div className="p-4 bg-red-50 text-red-900 rounded-xl">
                  <span className="text-xs text-red-600 block font-medium">要克服ターゲット</span>
                  <span className="text-2xl font-black mt-1 block">{wrongQuestions.length}</span>
                </div>
                <div className="p-4 bg-amber-50 text-amber-900 rounded-xl">
                  <span className="text-xs text-amber-600 block font-medium">要復習ブックマーク</span>
                  <span className="text-2xl font-black mt-1 block">{reviewQuestions.length}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW ENGINE: QUIZ INTERACTION MATRIX */}
        {appMode === 'quiz' && filteredQuizzes[currentQuizIndex] && (() => {
          const quiz = filteredQuizzes[currentQuizIndex];
          const isReviewMarked = reviewQuestions.includes(quiz.id);
          
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Question / Options Form Card Block */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Header context info strip */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-md">
                      問題 {currentQuizIndex + 1} / {filteredQuizzes.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium tracking-wide">
                      ID: #{quiz.id} | {quiz.category}
                    </span>
                  </div>
                  <button
                    onClick={handleAbandonSession}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-medium bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>中断して戻る</span>
                  </button>
                </div>

                {/* Primary Question Presentation Frame */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                      {quiz.title}
                    </h3>
                    <button
                      onClick={() => handleToggleReviewFlag(quiz.id)}
                      className={`ml-4 p-2.5 rounded-xl border transition-all shrink-0 ${isReviewMarked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'}`}
                      title="要復習フラグを切り替え"
                    >
                      <Bookmark className="h-5 w-5" fill={isReviewMarked ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {quiz.question}
                  </div>

                  {/* Interactive Options Group Selection Container */}
                  <div className="space-y-3 pt-2">
                    {quiz.options.map((opt) => {
                      let optionStyle = "border-slate-200 hover:border-slate-400 hover:bg-slate-50";
                      
                      if (isAnswered) {
                        if (opt.key === quiz.answer) {
                          optionStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium ring-2 ring-emerald-500/20";
                        } else if (selectedOption === opt.key) {
                          optionStyle = "border-rose-400 bg-rose-50/50 text-rose-950 ring-2 ring-rose-500/10";
                        } else {
                          optionStyle = "border-slate-200 opacity-60";
                        }
                      } else if (selectedOption === opt.key) {
                        optionStyle = "border-blue-600 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500/20 font-medium";
                      }

                      return (
                        <button
                          key={opt.key}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(opt.key)}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-sm md:text-base flex items-start space-x-3 ${optionStyle}`}
                        >
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 mt-0.5 ${selectedOption === opt.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {opt.key}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Validation Console Drawer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    {!isAnswered ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm rounded-xl tracking-wide transition-colors shadow-md shadow-blue-600/10"
                      >
                        解答を確定する
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl tracking-wide transition-colors shadow-md flex items-center space-x-2"
                      >
                        <span>{currentQuizIndex + 1 === filteredQuizzes.length ? '演習を完了する' : '次の問題へ'}</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Collateral Component Context Column: Instant Explanation Drawer */}
              <div className="lg:col-span-1">
                {isAnswered ? (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in space-y-6 p-6">
                    
                    {/* Verdict Banner Header block */}
                    <div className={`p-4 rounded-xl flex items-center space-x-3 ${selectedOption === quiz.answer ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                      {selectedOption === quiz.answer ? (
                        <>
                          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-bold block text-sm">正解です！</span>
                            <span className="text-xs opacity-90">解説を読んで理解を深めましょう。</span>
                          </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0">
                            <X className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-bold block text-sm">不正解（正解: {quiz.answer}）</span>
                            <span className="text-xs opacity-90">間違えた原因を分析しましょう。</span>
                          </>
                      )}
                    </div>

                    {/* Explanatory Content Block */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        <span>解答・解説詳細</span>
                      </h4>
                      <div className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 max-h-[420px] overflow-y-auto">
                        {quiz.explanation}
                      </div>
                    </div>

                    {/* Persistent Checkbox Component Toggle */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center space-x-3 bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={isReviewMarked}
                          onChange={() => handleToggleReviewFlag(quiz.id)}
                          className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-amber-900 block">この問題を要復習リストに追加</span>
                          <span className="text-[11px] text-amber-700/80 block mt-0.5">後ほど復習モードでピンポイント再確認できます。</span>
                        </div>
                      </label>
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-100/70 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm">
                    解答を確定すると、ここに詳細な解答・解説と復習管理コンソールが表示されます。
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* VIEW ENGINE: REVIEW MASTER OVERVIEW CONTAINER */}
        {appMode === 'review_list' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">要復習マーク問題一覧</h3>
                <p className="text-xs text-slate-500 mt-1">手動フラグまたは誤答履歴に基づいてピン留めされた確認項目です。</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                計 {reviewQuestions.length} 問
              </span>
            </div>

            {reviewQuestions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                現在、要復習に指定されている問題はありません。
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {QUIZ_DATA.filter(q => reviewQuestions.includes(q.id)).map((quiz) => (
                  <div key={quiz.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">{quiz.title}</h4>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {quiz.category}
                        </span>
                        {wrongQuestions.includes(quiz.id) && (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded">
                            直近不正解
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setFilteredQuizzes([quiz]);
                          setCurrentQuizIndex(0);
                          setSelectedOption(null);
                          setIsAnswered(false);
                          setQuizFilter('review');
                          setAppMode('quiz');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                      >
                        単問で解く
                      </button>
                      <button
                        onClick={() => handleToggleReviewFlag(quiz.id)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors"
                      >
                        除外
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW ENGINE: RECHARTS HISTORICAL METRICS REPORT */}
        {appMode === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">問題別正解率マトリクス</h3>
                <p className="text-xs text-slate-500 mt-1">過去の演習セッション全体における問題ごとの集計正解比率(%)チャートです。</p>
              </div>

              {Object.keys(historyLog).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  グラフを生成するための十分な解答データログが蓄積されていません。
                </div>
              ) : (
                <div className="w-full h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAnalyticsDataset()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="正解率(%)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="解答回数" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Performance Ledger Raw Audit Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-4">セッション履歴明細</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                      <th className="pb-3 font-semibold">問題タイトル</th>
                      <th className="pb-3 text-center font-semibold">解答総回数</th>
                      <th className="pb-3 text-center font-semibold">正解数</th>
                      <th className="pb-3 text-right font-semibold">正解率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {QUIZ_DATA.map(q => {
                      const stats = historyLog[q.id] || { total: 0, correct: 0 };
                      const rate = stats.total > 0 ? `${Math.round((stats.correct / stats.total) * 100)}%` : '-';
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-medium text-slate-800">{q.title}</td>
                          <td className="py-3 text-center text-slate-600">{stats.total} 回</td>
                          <td className="py-3 text-center text-emerald-600 font-medium">{stats.correct} 回</td>
                          <td className="py-3 text-right font-bold text-slate-900">{rate}</td>
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

      {/* Footer Branding Area */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 Small and Medium Enterprise Management Consultant Learning Hub. Powered by React & Firestore.</p>
      </footer>
    </div>
  );
}