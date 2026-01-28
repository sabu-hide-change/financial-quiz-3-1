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
      "受注生産は、生産リードタイムの短縮や受注の平準化が重点課題となる。",
      "見込生産は、需要量を予測して製品を作り、その作った製品は注文を受けてから販売するため、顧客が注文してからの納期が長くなる。",
      "見込生産は、需要の予測精度を高めることや、需要変動に柔軟に対応できる生産体制の確立が重点課題となる。"
    ],
    correctIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：ウ（不適切）</p>
        <p className="text-sm">
          見込生産は、あらかじめ製品を作って在庫を持っておく方式です。
          そのため、顧客から注文が入れば在庫から即座に出荷でき、<span className="font-bold text-blue-600">納期は短くなります</span>。
          「納期が長くなる」という記述は誤りです。
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          <div className="border p-2 rounded bg-blue-50">
            <span className="font-bold block mb-1">受注生産</span>
            ・注文後に生産<br/>
            ・課題：LT短縮、受注平準化
          </div>
          <div className="border p-2 rounded bg-green-50">
            <span className="font-bold block mb-1">見込生産</span>
            ・予測で生産<br/>
            ・注文後の納期は短い<br/>
            ・課題：需要予測精度、在庫管理
          </div>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "生産形態の分類",
    questionText: `製品の生産は、その種類と量によって、適した生産形態やレイアウトが選択される。次の組み合わせで、最も不適切なものはどれか。`,
    options: [
      "連続生産 － 少品種多量生産 － 製品別レイアウト",
      "ロット生産 － 見込生産 － グループ別レイアウト",
      "個別生産 － 多品種少量生産 － 機能別レイアウト",
      "連続生産 － 受注生産 － 製品別レイアウト",
      "ロット生産 － 中品種中量生産 － グループ別レイアウト"
    ],
    correctIndex: 3,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：エ（不適切）</p>
        <p className="text-sm">
          連続生産は「少品種多量生産」に適しており、専用ラインで大量に作るため、通常は需要予測に基づく<span className="font-bold text-blue-600">「見込生産」</span>が行われます。
          受注生産で連続生産を行うことは一般的ではありません。
        </p>
        
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-1">生産形態</th>
                <th className="border p-1">品種・量</th>
                <th className="border p-1">レイアウト</th>
                <th className="border p-1">タイミング</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1 font-bold">個別生産</td>
                <td className="border p-1">多品種少量</td>
                <td className="border p-1">機能別</td>
                <td className="border p-1">受注生産</td>
              </tr>
              <tr>
                <td className="border p-1 font-bold">ロット生産</td>
                <td className="border p-1">中品種中量</td>
                <td className="border p-1">グループ別</td>
                <td className="border p-1">両方あり</td>
              </tr>
              <tr>
                <td className="border p-1 font-bold">連続生産</td>
                <td className="border p-1">少品種多量</td>
                <td className="border p-1">製品別</td>
                <td className="border p-1 font-bold text-blue-600">見込生産</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "段取り（Setup）",
    questionText: `生産効率やライン稼働率を向上するために重要な段取りに関する記述として、最も不適切なものはどれか。`,
    options: [
      "ロット生産において、まとめ生産の量が減少すると、段取り頻度は減る傾向にある。",
      "設備の稼働率を高めるために、内段取りを外段取りに変更した。",
      "生産効率を上げるため、生産計画を立てる際に、同一工程で生産する別の製品を続けて生産することを検討した。",
      "段取り時間を短縮して10分未満にすることを、シングル段取りと呼ぶ。"
    ],
    correctIndex: 0,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：ア（不適切）</p>
        <p className="text-sm">
          ロット生産において、一度に生産する量（ロットサイズ）が小さくなる（減少する）と、
          品種を切り替える回数が増えるため、<span className="font-bold text-red-600">段取り頻度は増えます</span>。
        </p>

        <div className="bg-slate-50 p-3 rounded text-sm space-y-2 border">
          <p><span className="font-bold">内段取り vs 外段取り:</span> 機械を止めて行うのが「内」、止めている間に外で準備するのが「外」。内を外に変えると稼働率は上がります（正）。</p>
          <p><span className="font-bold">シングル段取り:</span> 段取り時間を一桁（9分59秒以内、つまり10分未満）にすること（正）。</p>
          <p><span className="font-bold">ゼロ段取り:</span> 3分以内を目指すこと。</p>
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: "生産方式（ライン vs セル）",
    questionText: `生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      "ライン生産方式からセル生産方式に変更するため、類似の加工物をグループ化し、機械の配置を見直した。",
      "ライン方式は、セル生産方式と比べて作業者の育成に時間がかかる。",
      "ラインバランシングを向上するため、ライン生産方式からセル生産方式に切替えた。",
      "工程間の仕掛品をなくすため、ライン生産方式からセル生産方式（1人生産方式）に変更した。"
    ],
    correctIndex: 1,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：イ（不適切）</p>
        <p className="text-sm">
          ライン生産方式は「単能工（1人1工程）」が基本であり、作業が単純なため育成時間は短くて済みます。
          一方、セル生産方式は「多能工（1人で複数工程）」が必要なため、<span className="font-bold text-blue-600">セル生産方式の方が育成に時間がかかります</span>。
        </p>
        <LineProductionDiagram />
        <p className="text-xs text-slate-500">
          記述イは「ライン方式の方が時間がかかる」と言っているため誤りです。
        </p>
      </div>
    )
  },
  {
    id: 10,
    title: "セル生産方式の特徴",
    questionText: `セル生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      "セル生産方式は、主にU字ライン方式と1人生産方式がある。",
      "セル生産方式は、うまく導入すればバランスロスが少なくなり、仕掛品在庫を削減して、生産性を高めることができる。",
      "U字ライン方式では、作業者が1人で複数の工程を担当するため、短期間で作業を修得できるといったメリットがある。",
      "1人生産方式では、1人で最初から最後までの作業を行うため、基本的に工程間の仕掛品が発生しないといったメリットがある。"
    ],
    correctIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：ウ（不適切）</p>
        <p className="text-sm">
          U字ライン方式（セル生産）では、1人が複数の工程を担当するため、<span className="font-bold text-blue-600">作業の習熟（修得）には時間がかかります</span>。
          「短期間で習得できる」という点が誤りです。
        </p>
        <CellProductionUDiagram />
        <div className="text-sm border-t pt-2">
           <span className="font-bold text-blue-700">セル生産のメリット：</span>
           <ul className="list-disc pl-5 text-xs text-slate-600 mt-1">
             <li>バランスロスの低減（手待ち時間の削減）</li>
             <li>仕掛品の削減（特に1人生産方式）</li>
             <li>生産変動への柔軟な対応</li>
             <li>作業者のモチベーション向上（責任範囲拡大）</li>
           </ul>
        </div>
      </div>
    )
  },
  {
    id: 11,
    title: "ライン生産方式の特徴",
    questionText: `ライン生産方式に関する記述として、最も不適切なものはどれか。`,
    options: [
      "ライン生産方式は、単能工で作業を行うため生産性が高く、管理しやすいことがメリットである。",
      "ライン生産方式は、製品や生産量の変化に柔軟に対応しにくい点がデメリットである。",
      "ライン生産方式は、生産計画を変更した場合にレイアウトを柔軟に変更しやすいというメリットがある。",
      "ライン生産方式には、特定の単一品種を連続して生産する方式と、同じラインで複数の品種を生産する方式がある。"
    ],
    correctIndex: 2,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：ウ（不適切）</p>
        <p className="text-sm">
          ライン生産方式は、専用設備を設置してコンベア等で連結するため、一度設置すると<span className="font-bold text-red-600">レイアウトの変更は困難</span>です。
          「レイアウトを柔軟に変更しやすい」のは、セル生産方式の特徴です。
        </p>
        <div className="bg-slate-50 p-2 rounded text-xs border">
          <p className="font-bold mb-1">ライン生産の種類</p>
          <ul className="list-disc pl-4">
            <li>単一品種ライン</li>
            <li>多品種ライン（ライン切り替え方式、混合ライン方式）</li>
          </ul>
          <p className="mt-1 text-slate-500">※これらはありますが、レイアウトの柔軟性はありません。</p>
        </div>
      </div>
    )
  },
  {
    id: 12,
    title: "ラインバランシング",
    questionText: `ラインバランシングに関する記述として、最も不適切なものはどれか。`,
    options: [
      "ラインバランシングとは、生産ライン上の各工程の作業時間をなるべく均一にすることを指す。",
      "ピッチダイアグラムでは、各作業ステーションを横軸に取り、作業時間を縦軸で表す。",
      "生産ラインに資材を投入する時間間隔をサイクルタイムという。",
      "サイクルタイムは、最も作業時間が短い作業ステーションの作業時間と同じになる。"
    ],
    correctIndex: 3,
    explanation: (
      <div className="space-y-3">
        <p className="text-sm font-bold text-red-600">正解：エ（不適切）</p>
        <p className="text-sm">
          サイクルタイム（ピッチタイム）は、ライン全体のアウトプット速度を決めるものであり、
          <span className="font-bold text-red-600">最も作業時間が「長い」ボトルネック工程</span>の時間と一致します。
          一番遅い工程に合わせないとラインが流れないためです。
        </p>
        <PitchDiagram />
      </div>
    )
  },
  {
    id: 13,
    title: "ライン編成効率の計算",
    questionText: (
      <div>
        次の表に示されるラインがある。このラインの記述に関して、最も適切なものはどれか。
        <div className="overflow-x-auto my-4">
          <table className="min-w-full text-sm border-collapse border border-slate-300 text-center">
            <thead className="bg-orange-100">
              <tr>
                <th className="border p-2">作業工程</th>
                <th className="border p-2 w-12">A</th>
                <th className="border p-2 w-12">B</th>
                <th className="border p-2 w-12">C</th>
                <th className="border p-2 w-12">D</th>
                <th className="border p-2 w-12">E</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 bg-orange-50 font-bold">作業時間 [分]</td>
                <td className="border p-2">5</td>
                <td className="border p-2">4</td>
                <td className="border p-2 font-bold text-red-600">8</td>
                <td className="border p-2">6</td>
                <td className="border p-2">7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    options: [
      "このラインのライン編成効率は、80%である。",
      "作業工程Bの手前では手待ちが発生し、作業工程Eの手前では仕掛品の数が最も多くなる。",
      "全ての工程の作業負荷を均一にしたところ、生産性が25%改善した。",
      "作業工程を一つ追加して、ラインバランスを見直すことで、サイクルタイム数を最大で4分まで短縮できる。"
    ],
    correctIndex: 2,
    explanation: (
      <div className="space-y-4">
        <p className="text-sm font-bold text-green-600">正解：ウ</p>
        
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h5 className="font-bold text-slate-700 mb-2 border-b pb-1">現状の計算</h5>
          <ul className="text-sm space-y-1 font-mono">
            <li>合計時間 = 5+4+8+6+7 = 30分</li>
            <li>サイクルタイム(最大) = 8分 (工程C)</li>
            <li>工程数 = 5</li>
            <li className="font-bold pt-2">ライン編成効率 = 合計時間 ÷ (サイクル × 工程数)</li>
            <li>　　　　　　　 = 30 ÷ (8 × 5)</li>
            <li>　　　　　　　 = 30 ÷ 40 = 0.75 (75%)</li>
            <li>バランスロス率 = 100% - 75% = 25%</li>
          </ul>
        </div>

        <div className="text-sm space-y-2">
          <p><span className="font-bold">ア (×):</span> 効率は75%です（80%ではない）。</p>
          <p><span className="font-bold">イ (×):</span> 仕掛品は作業時間の長い工程の手前に溜まります。最も溜まるのは工程C（8分）の手前です。</p>
          <p><span className="font-bold text-green-600">ウ (○):</span> 現在の効率は75%（バランスロス25%）。全ての負荷が均一になればロスは0%、効率は100%になります。つまり25%分の改善が見込めます（または生産性が向上します）。</p>
          <p><span className="font-bold">エ (×):</span> 合計時間は30分です。工程を1つ増やして6工程にしても、理想的なサイクルタイムは 30÷6 = 5分です。4分にはなりません。</p>
        </div>
      </div>
    )
  }
];

// --- メインアプリコンポーネント ---

export default function App() {
  // ステート
  const [screen, setScreen] = useState('dashboard'); // dashboard, quiz, result
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [history, setHistory] = useState({}); // { [id]: { isCorrect: boolean, date: string } }
  const [bookmarks, setBookmarks] = useState([]); // [id, id, ...]
  const [quizMode, setQuizMode] = useState('all'); // all, incorrect, bookmarked
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });

  // 初期ロード
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('quizHistory') || '{}');
    const savedBookmarks = JSON.parse(localStorage.getItem('quizBookmarks') || '[]');
    setHistory(savedHistory);
    setBookmarks(savedBookmarks);
    console.log("App Loaded. History:", savedHistory);
  }, []);

  // 保存処理
  const updateHistory = (problemId, isCorrect) => {
    const newHistory = {
      ...history,
      [problemId]: { isCorrect, date: new Date().toISOString() }
    };
    setHistory(newHistory);
    localStorage.setItem('quizHistory', JSON.stringify(newHistory));
  };

  const toggleBookmark = (problemId) => {
    let newBookmarks;
    if (bookmarks.includes(problemId)) {
      newBookmarks = bookmarks.filter(id => id !== problemId);
    } else {
      newBookmarks = [...bookmarks, problemId];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('quizBookmarks', JSON.stringify(newBookmarks));
  };

  // クイズ開始
  const startQuiz = (mode) => {
    let problemsToSolve = [];
    if (mode === 'all') {
      problemsToSolve = PROBLEMS;
    } else if (mode === 'incorrect') {
      problemsToSolve = PROBLEMS.filter(p => history[p.id]?.isCorrect === false);
    } else if (mode === 'bookmarked') {
      problemsToSolve = PROBLEMS.filter(p => bookmarks.includes(p.id));
    }

    if (problemsToSolve.length === 0) {
      alert("該当する問題がありません。");
      return;
    }

    setQuizMode(mode);
    setFilteredProblems(problemsToSolve);
    setCurrentProblemIndex(0);
    setSessionScore({ correct: 0, total: 0 });
    setIsAnswered(false);
    setSelectedOption(null);
    setScreen('quiz');
    console.log(`Quiz Started. Mode: ${mode}, Count: ${problemsToSolve.length}`);
  };

  // 解答提出
  const submitAnswer = () => {
    if (selectedOption === null) return;
    
    const currentProblem = filteredProblems[currentProblemIndex];
    const isCorrect = selectedOption === currentProblem.correctIndex;
    
    setIsAnswered(true);
    updateHistory(currentProblem.id, isCorrect);
    
    if (isCorrect) {
      setSessionScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  // 次の問題へ
  const nextProblem = () => {
    const nextIndex = currentProblemIndex + 1;
    if (nextIndex < filteredProblems.length) {
      setCurrentProblemIndex(nextIndex);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setSessionScore(prev => ({ ...prev, total: filteredProblems.length }));
      setScreen('result');
    }
  };

  // 画面レンダリング

  // 1. ダッシュボード
  if (screen === 'dashboard') {
    const totalSolved = Object.keys(history).length;
    const totalCorrect = Object.values(history).filter(h => h.isCorrect).length;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    const incorrectCount = PROBLEMS.filter(p => history[p.id]?.isCorrect === false).length;

    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
        <div className="max-w-md mx-auto space-y-6">
          <header className="flex items-center gap-2 mb-6">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">スマート問題集</h1>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">3-1 生産管理</span>
          </header>

          {/* スタッツカード */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500 mb-1">正解率</div>
              <div className="text-xl font-bold text-blue-600">{accuracy}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">実施済</div>
              <div className="text-xl font-bold text-slate-700">{totalSolved}/{PROBLEMS.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">要復習</div>
              <div className="text-xl font-bold text-amber-500">{bookmarks.length}</div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <button 
              onClick={() => startQuiz('all')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> 全問スタート
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => startQuiz('incorrect')}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> 
                <div className="flex flex-col items-start">
                  <span className="text-sm">前回不正解</span>
                  <span className="text-xs font-normal opacity-70">{incorrectCount}問</span>
                </div>
              </button>
              <button 
                onClick={() => startQuiz('bookmarked')}
                className="bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Bookmark className="w-4 h-4" /> 
                <div className="flex flex-col items-start">
                  <span className="text-sm">要復習のみ</span>
                  <span className="text-xs font-normal opacity-70">{bookmarks.length}問</span>
                </div>
              </button>
            </div>
          </div>

          {/* 問題リスト */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-600 flex items-center gap-2">
              <List className="w-4 h-4" /> 問題一覧
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {PROBLEMS.map((problem) => {
                const status = history[problem.id];
                const isBookmarked = bookmarks.includes(problem.id);
                return (
                  <div key={problem.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6">
                        {status ? (
                          status.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                        )}
                      </div>
                      <div className="text-sm">
                        <div className="font-bold text-slate-700">問{problem.id}</div>
                        <div className="text-xs text-slate-500 truncate w-48">{problem.title}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleBookmark(problem.id)}
                      className={`p-2 rounded-full ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:bg-slate-100'}`}
                    >
                      <Bookmark className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. クイズ画面
  if (screen === 'quiz') {
    const problem = filteredProblems[currentProblemIndex];
    if (!problem) return <div>Loading...</div>;

    const isCorrect = selectedOption === problem.correctIndex;
    const isBookmarked = bookmarks.includes(problem.id);

    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 pb-20">
        <div className="max-w-md mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => {
                 if (confirm('学習を中断してダッシュボードに戻りますか？')) setScreen('dashboard');
              }}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              中断
            </button>
            <div className="text-sm font-bold text-slate-600">
              {currentProblemIndex + 1} / {filteredProblems.length}
            </div>
          </div>

          {/* 進捗バー */}
          <div className="w-full bg-slate-200 h-2 rounded-full mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentProblemIndex) / filteredProblems.length) * 100}%` }}
            />
          </div>

          {/* 問題カード */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-4">
            <h2 className="text-lg font-bold mb-4 flex items-start gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mt-1 whitespace-nowrap">問{problem.id}</span>
              {problem.title}
            </h2>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 mb-4">
              {/* 問題文中のオブジェクトを描画するためにReactNodeとして扱う場合は注意が必要だが、今回は文字列内に特殊な要素がないためそのまま表示 */}
              {typeof problem.questionText === 'string' ? problem.questionText : problem.questionText}
            </div>

            {/* 選択肢 */}
            <div className="space-y-3">
              {problem.options.map((option, idx) => (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedOption === idx 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-100' 
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  } ${isAnswered && idx === problem.correctIndex ? 'bg-green-50 border-green-500 ring-2 ring-green-100' : ''}
                    ${isAnswered && selectedOption === idx && idx !== problem.correctIndex ? 'bg-red-50 border-red-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      selectedOption === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'
                    }`}>
                      <span className="text-xs">{['ア','イ','ウ','エ','オ'][idx]}</span>
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 解説エリア（解答後表示） */}
          {isAnswered && (
            <div className="animate-fade-in-up">
              {/* 正誤バナー */}
              <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                <div>
                  <div className="font-bold text-lg">{isCorrect ? '正解！' : '不正解...'}</div>
                  <div className="text-xs opacity-80">{isCorrect ? 'ナイス！この調子でいきましょう。' : '解説を読んで復習しましょう。'}</div>
                </div>
              </div>

              {/* 解説本文 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                  <span className="font-bold text-slate-700">解説</span>
                </div>
                <div className="text-slate-700">
                  {problem.explanation}
                </div>

                {/* チェックボックス */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition ${
                        isBookmarked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                         <Bookmark className="w-4 h-4 fill-current" />
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isBookmarked}
                        onChange={() => toggleBookmark(problem.id)}
                      />
                      <span className={`text-sm font-bold transition ${isBookmarked ? 'text-amber-600' : 'text-slate-500'}`}>
                        {isBookmarked ? '要復習リストに追加済み' : '要復習リストに追加する'}
                      </span>
                   </label>
                </div>
              </div>
            </div>
          )}

          {/* フッターアクション */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom">
            <div className="max-w-md mx-auto">
              {!isAnswered ? (
                <button 
                  onClick={submitAnswer}
                  disabled={selectedOption === null}
                  className={`w-full font-bold py-3 rounded-xl shadow transition ${
                    selectedOption !== null 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  解答する
                </button>
              ) : (
                <button 
                  onClick={nextProblem}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  次の問題へ <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. 結果画面
  if (screen === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">お疲れ様でした！</h2>
            <p className="opacity-80 text-sm">今回の学習結果</p>
          </div>
          <div className="p-8 text-center">
            <div className="text-6xl font-bold text-slate-800 mb-2">
              {sessionScore.correct}
              <span className="text-2xl text-slate-400 font-normal">/{sessionScore.total}</span>
            </div>
            <p className="text-slate-500 mb-8">正解数</p>

            <button 
              onClick={() => setScreen('dashboard')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow transition"
            >
              ダッシュボードへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}