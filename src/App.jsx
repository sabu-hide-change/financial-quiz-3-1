import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Play, 
  RotateCcw, 
  Bookmark, 
  Check, 
  X, 
  ChevronRight, 
  BarChart2, 
  List,
  ArrowRight,
  User
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * 依存関係:
 * npm install lucide-react recharts
 * * ビルド対策:
 * CI=false npm run build (未使用変数の警告などでビルドが止まる場合)
 */

// --- コンポーネント: 図解再現用 ---

// ライン生産方式の図解
const LineProductionDiagram = () => (
  <div className="flex flex-col items-center gap-4 my-4 p-4 bg-white rounded border border-slate-200">
    <h4 className="font-bold text-slate-700">◆ライン生産方式</h4>
    <div className="flex flex-wrap justify-center items-center gap-2">
      <span className="text-xs font-bold text-slate-500">資材投入</span>
      <ArrowRight className="w-4 h-4 text-slate-400" />
      {[1, 2, 3, 4, 5].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <User className="w-5 h-5 text-slate-700 mb-1" />
            <div className={`w-16 h-12 flex items-center justify-center text-xs font-bold text-white rounded shadow ${
              step % 2 === 0 ? 'bg-blue-500' : 'bg-blue-600'
            }`}>
              工程{step}
            </div>
          </div>
          {step < 5 && <ArrowRight className="w-4 h-4 text-slate-400" />}
        </React.Fragment>
      ))}
      <ArrowRight className="w-4 h-4 text-slate-400" />
      <span className="text-xs font-bold text-slate-500">製品完成</span>
    </div>
    <p className="text-xs text-slate-500 mt-2">※流れ作業による生産（ベルトコンベア等）</p>
  </div>
);

// セル生産方式（U字ライン）の図解
const CellProductionUDiagram = () => (
  <div className="flex flex-col items-center gap-4 my-4 p-4 bg-white rounded border border-slate-200">
    <h4 className="font-bold text-slate-700">◆セル生産方式（U字ライン）</h4>
    <div className="relative w-64 h-48 bg-slate-50 rounded border border-slate-100 p-4">
       {/* U字レイアウトの配置 */}
       <div className="absolute top-2 left-2 w-16 h-12 bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800 rounded">工程1</div>
       <div className="absolute top-2 left-24 w-16 h-12 bg-blue-300 flex items-center justify-center text-xs font-bold text-blue-800 rounded">工程2</div>
       <div className="absolute top-16 right-2 w-16 h-12 bg-blue-400 flex items-center justify-center text-xs font-bold text-white rounded">工程3</div>
       <div className="absolute bottom-2 right-24 w-16 h-12 bg-blue-500 flex items-center justify-center text-xs font-bold text-white rounded">工程4</div>
       <div className="absolute bottom-2 left-2 w-16 h-12 bg-slate-700 flex items-center justify-center text-xs font-bold text-white rounded">工程5</div>
       
       {/* 作業者 */}
       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
         <User className="w-8 h-8 text-slate-800" />
         <div className="border-t-2 border-l-2 border-slate-800 w-32 h-20 rounded-tl-full absolute -z-10 top-2 -left-8 opacity-20"></div>
       </div>
    </div>
    <p className="text-xs text-slate-500">※多能工が複数の工程を受け持ち、U字型に移動</p>
  </div>
);

// ピッチダイアグラム（Recharts使用）
const PitchDiagram = () => {
  const data = [
    { name: 'A', time: 3, ideal: 5 },
    { name: 'B', time: 5, ideal: 5 },
    { name: 'C', time: 4, ideal: 5 },
  ];

  return (
    <div className="w-full h-64 my-4 bg-white p-2 rounded border border-slate-200">
      <h4 className="text-center font-bold text-slate-700 mb-2">◆ピッチダイアグラムの例</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: '作業ステーション', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: '作業時間(分)', angle: -90, position: 'insideLeft' }} domain={[0, 6]} />
          <Tooltip />
          <ReferenceLine y={5} label="サイクルタイム (5分)" stroke="red" strokeDasharray="3 3" />
          <Bar dataKey="time" name="作業時間" fill="#fcd34d">
            {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill="#fef08a" stroke="#f59e0b" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-slate-500 mt-[-10px]">
        ※工程B（5分）がボトルネックとなり、サイクルタイムを決定する
      </div>
    </div>
  );
};


// --- データ定義 ---

const PROBLEMS = [
  {
    id: 1,
    title: "生産管理の定義",
    questionText: `生産管理に関する次の文中の、空欄Ａ～Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群より選べ。

生産管理とは、財・【 Ａ 】の生産に関する管理活動のことで、管理対象は【 Ｂ 】・調達・生産の3つから構成される。所定の品質・原価・数量および納期で生産するため、人・物・金・【 Ｃ 】を駆使して、需要予測・生産計画・生産実施・【 Ｄ 】を行う手続およびその活動である。`,
    options: [
      "Ａ：商品　　　Ｂ：販売　Ｃ：知識　Ｄ：在庫統制",
      "Ａ：サービス　Ｂ：設計　Ｃ：設備　Ｄ：生産統制",
      "Ａ：商品　　　Ｂ：販売　Ｃ：情報　Ｄ：在庫統制",
      "Ａ：サービス　Ｂ：設計　Ｃ：情報　Ｄ：生産統制"
    ],
    correctIndex: 3,
    explanation: (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="font-bold text-blue-800 mb-2">JIS（日本産業規格）による定義</p>
          <p className="text-sm leading-relaxed">
            「財・<span className="font-bold text-red-600">サービス</span>の生産に関する管理活動。所定の品質・原価・数量および納期で生産するため、人・物・金・<span className="font-bold text-red-600">情報</span>を駆使して、需要予測・生産計画・生産実施・<span className="font-bold text-red-600">生産統制</span>を行う手続およびその活動。」
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="p-2 border-b border-slate-200">
            <span className="font-bold">A: サービス</span> - 商品には財とサービスの両方が含まれます。
          </div>
          <div className="p-2 border-b border-slate-200">
            <span className="font-bold">B: 設計</span> - 生産の構成要素は「設計・調達・作業（生産）」です。「販売」は含まれません。
          </div>
          <div className="p-2 border-b border-slate-200">
            <span className="font-bold">C: 情報</span> - 経営資源は「ヒト・モノ・カネ・情報」です。
          </div>
          <div className="p-2">
            <span className="font-bold">D: 生産統制</span> - 在庫統制は生産統制の一部です。定義上は「生産統制」が適切です。
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "生産の管理目標 (PQCDSME)",
    questionText: `生産における管理目標（P,Q,C,D,S,M,E)の記号と活動例の組み合わせとして、最も適切なものはどれか。`,
    options: [
      "P － 購買部門では、材料を安く購入するため複数のサプライヤーから見積もりを入手する。",
      "D － 生産管理部門では、納期を守るため資材の在庫状況や作業の進捗状況を定期的に確認する。",
      "C － 品質部門では、出荷前に製品に異常がないか検査を行う。",
      "S － 設計部門では、前モデルに対して消費電力が50%少なくなるように新製品を開発した。"
    ],
    correctIndex: 1,
    explanation: (
      <div className="space-y-4">
        <p className="text-sm">PQCDSMEの各要素の意味を理解しましょう。</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse border border-slate-300">
            <thead className="bg-blue-100">
              <tr>
                <th className="border p-2">項目</th>
                <th className="border p-2">意味</th>
                <th className="border p-2">内容</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-bold text-red-600">P (Productivity)</td>
                <td className="border p-2">生産性</td>
                <td className="border p-2">インプットに対しアウトプットを多くする</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">Q (Quality)</td>
                <td className="border p-2">品質</td>
                <td className="border p-2">決められた品質を提供する</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">C (Cost)</td>
                <td className="border p-2">原価</td>
                <td className="border p-2">安いコストで生産する</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">D (Delivery)</td>
                <td className="border p-2">納期・数量</td>
                <td className="border p-2">納期と数量を守る</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">S (Safety)</td>
                <td className="border p-2">安全性</td>
                <td className="border p-2">安全な環境・製品を提供する</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">M (Morale)</td>
                <td className="border p-2">意欲</td>
                <td className="border p-2">働きがいのある職場</td>
              </tr>
              <tr>
                <td className="border p-2 font-bold text-red-600">E (Environment)</td>
                <td className="border p-2">環境性</td>
                <td className="border p-2">環境負荷をかけない</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><span className="font-bold">ア (×):</span> 材料を安く購入 → Cost (C)</li>
          <li><span className="font-bold">イ (○):</span> 納期を守る、進捗確認 → Delivery (D)</li>
          <li><span className="font-bold">ウ (×):</span> 出荷前の検査 → Quality (Q)</li>
          <li><span className="font-bold">エ (×):</span> 消費電力削減（環境配慮） → Environment (E)</li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    title: "生産効率化の原則 (3S/5S/ECRS)",
    questionText: `生産を効率化し、生産性を高めるためには、幾つかの原則がある。これらの原則の説明として、最も不適切なものはどれか。`,
    options: [
      "ネジの締め付け工程を、手作業から電動ドライバを用いる方法に変更することで作業時間を短縮した。この内容は、ECRSの原則のRを適用したことになる。",
      "電話応対に関するルールを決めて、全社員がこれを徹底することにした。この内容は5Sの原則の躾を適用したことになる。",
      "作業者によって、品質や作業時間に大きなばらつきが生じないように、作業手順を書類にした。この内容は3Sの原則の標準化を適用したことになる。",
      "工場の部品棚に保管していた部品の中で、古くて使う予定がないものを廃棄した。この内容は5Sの原則の整頓を適用したことになる。",
      "同じ顧客へ送る荷物を一つに纏めることで、送料を下げることが出来た。この内容は、ECRSの原則のCを適用したことになる。"
    ],
    correctIndex: 3,
    explanation: (
      <div className="space-y-4">
        <p className="text-sm font-bold text-red-600">正解：エ（不適切）</p>
        <p className="text-sm">
          不要なものを廃棄することは、5Sの<span className="font-bold">「整理 (Seiri)」</span>に該当します。
          「整頓 (Seiton)」は、必要なものをすぐに取り出せるように配置することです。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded border">
            <h5 className="font-bold text-blue-700 text-sm mb-2">5Sの原則</h5>
            <ul className="text-xs space-y-1">
              <li><span className="font-bold">整理:</span> 不要なものを捨てる</li>
              <li><span className="font-bold">整頓:</span> すぐ使えるように配置</li>
              <li><span className="font-bold">清掃:</span> 綺麗に保つ</li>
              <li><span className="font-bold">清潔:</span> 綺麗な状態を維持</li>
              <li><span className="font-bold">躾:</span> ルールを守る</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-3 rounded border">
            <h5 className="font-bold text-blue-700 text-sm mb-2">ECRSの原則（改善の4原則）</h5>
            <ul className="text-xs space-y-1">
              <li><span className="font-bold">E (Eliminate):</span> なくせないか</li>
              <li><span className="font-bold">C (Combine):</span> 一緒にできないか</li>
              <li><span className="font-bold">R (Replace):</span> 置き換えられないか（手作業→電動など）</li>
              <li><span className="font-bold">S (Simplify):</span> 単純化できないか</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "生産効率化の用語",
    questionText: `生産の効率化に関する記述として、最も不適切なものはどれか。`,
    options: [
      "生産性は、産出された量に対する投入した量の比率で求めることができる。",
      "稼働率は、人または機械の利用可能時間に対する有効稼働時間との比率である。",
      "歩留りは、投入された主原材料の量とその主原材料から実際に産出された品物の量との比率である。",
      "生産リードタイムは、生産を着手してから出荷できる状態になるまでの時間を指し、工程間で滞留していた時間も生産リードタイムに含まれる。"
    ],
    correctIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：ア（不適切）</p>
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-sm font-bold mb-1">生産性の公式</p>
          <p className="text-lg text-center font-mono bg-white p-2 rounded border border-yellow-300">
            生産性 ＝ 産出量 (Output) ÷ 投入量 (Input)
          </p>
          <p className="text-xs mt-2 text-slate-600">
            選択肢は「産出量に対する投入量の比率（投入÷産出）」となっているため誤りです。分母と分子が逆です。
          </p>
        </div>
        <ul className="text-sm space-y-2">
          <li><span className="font-bold">稼働率:</span> 利用可能時間に対する有効稼働時間の比率。正しい記述です。</li>
          <li><span className="font-bold">歩留り:</span> 投入材料に対する良品の比率。正しい記述です。</li>
          <li><span className="font-bold">生産リードタイム:</span> 着手から完了までの時間。滞留時間（待ち時間）も含まれます。正しい記述です。</li>
        </ul>
      </div>
    )
  },
  {
    id: 5,
    title: "自主管理活動 (QCサークル)",
    questionText: `自主管理活動に関する記述として、最も適切なものはどれか。`,
    options: [
      "組織において、トップダウンの命令系統を重視した活動である。",
      "QCサークルは自発的に集まった仲間でグループを構成して、会社の品質に関する問題の解決にあたる活動である。",
      "活動を行う目的の一つとして、従業員の自発性を高めることがある。",
      "QCサークルは品質（Q）とコスト（C）を中心に改善を行う自主管理活動である。"
    ],
    correctIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm">
          自主管理活動（小集団活動）は、<span className="font-bold text-blue-600">従業員の自主性</span>を尊重することが最大の特徴です。
        </p>
        <div className="space-y-2 text-sm border-t pt-2">
          <p><span className="font-bold">ア (×):</span> トップダウンではなく、ボトムアップ（自主性）を重視します。</p>
          <p><span className="font-bold">イ (×):</span> 通常、同じ職場や業務をするグループで構成されます。「自発的に集まった仲間」だけではありません。</p>
          <p><span className="font-bold text-green-600">ウ (○):</span> 従業員の自発性、能力向上、創意工夫を引き出すことが主な目的です。</p>
          <p><span className="font-bold">エ (×):</span> QCサークルのQCは Quality Control の略であり、主に「品質」に関する活動です。コスト(C)が中心ではありません。</p>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "受注生産と見込生産",
    questionText: `受注生産と見込生産に関する説明として、最も不適切なものはどれか。`,
    options: [
      "受注生産には、個別受注生産と繰返し受注生産がある。",
      "受注