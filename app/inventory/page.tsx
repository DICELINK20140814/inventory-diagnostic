"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BusinessType = "manufacturing" | "wholesale" | "retail" | "ec";

type DriverKey =
  | "forecast"
  | "replenishment"
  | "safety_stock"
  | "sku"
  | "leadtime"
  | "visibility"
  | "accuracy";

type Question = {
  id: string;
  section: string;
  text: string;
  driver: DriverKey;
};

const DRIVER_LABELS: Record<DriverKey, string> = {
  forecast: "需要予測",
  replenishment: "発注ロジック",
  safety_stock: "安全在庫",
  sku: "SKU構成",
  leadtime: "リードタイム",
  visibility: "在庫可視化",
  accuracy: "在庫精度",
};

const DRIVER_COMMENTS: Record<DriverKey, string> = {
  forecast:
    "需要予測の精度に改善余地があり、将来需要に対して過剰在庫または欠品が発生している可能性があります。",
  replenishment:
    "発注点・発注量の設定が最適化されておらず、発注ロジックが在庫増加の要因になっている可能性があります。",
  safety_stock:
    "安全在庫の設定根拠が曖昧で、必要以上の在庫を持っている可能性があります。",
  sku:
    "SKU構成が複雑化しており、低回転品や不要SKUが在庫全体を押し上げている可能性があります。",
  leadtime:
    "リードタイムが長い、もしくは不安定なため、余裕在庫を持たざるを得ない構造になっている可能性があります。",
  visibility:
    "在庫状況や滞留在庫の可視化が不十分で、過剰在庫を早期に是正できていない可能性があります。",
  accuracy:
    "棚卸差異や入出庫精度の問題により、在庫データの信頼性が低下している可能性があります。",
};

const PRIORITY_ACTIONS: Record<DriverKey, string> = {
  forecast:
    "まずは需要予測の精度検証を行い、実績との差分を定量的に把握したうえで予測手法の見直しから着手することが重要と考えられます。",
  replenishment:
    "まずは発注点・発注量のルールを整理し、属人的な発注から標準化された発注ロジックへの移行に着手することが重要と考えられます。",
  safety_stock:
    "まずは安全在庫の設定根拠を明文化し、SKUごとの見直しから着手することが重要と考えられます。",
  sku:
    "まずは低回転SKU・滞留SKUの棚卸しを行い、SKU整理と品揃え適正化から着手することが重要と考えられます。",
  leadtime:
    "まずはサプライヤー別・製品別のリードタイム実績を把握し、ばらつき低減と短縮施策から着手することが重要と考えられます。",
  visibility:
    "まずは在庫数量・在庫金額・滞留在庫の見える化を進め、日次または週次で把握できる体制づくりから着手することが重要と考えられます。",
  accuracy:
    "まずは棚卸差異と入出庫ミスの実態把握を行い、在庫精度改善のルール整備から着手することが重要と考えられます。",
};

const WEIGHTS: Record<BusinessType, Record<DriverKey, number>> = {
  manufacturing: {
    forecast: 1.5,
    replenishment: 1.3,
    safety_stock: 1.3,
    sku: 1.2,
    leadtime: 1.5,
    visibility: 1.2,
    accuracy: 1.0,
  },
  wholesale: {
    forecast: 1.3,
    replenishment: 1.5,
    safety_stock: 1.5,
    sku: 1.3,
    leadtime: 1.2,
    visibility: 1.3,
    accuracy: 1.0,
  },
  retail: {
    forecast: 1.5,
    replenishment: 1.4,
    safety_stock: 1.4,
    sku: 1.5,
    leadtime: 1.0,
    visibility: 1.3,
    accuracy: 1.2,
  },
  ec: {
    forecast: 1.5,
    replenishment: 1.4,
    safety_stock: 1.4,
    sku: 1.5,
    leadtime: 1.0,
    visibility: 1.3,
    accuracy: 1.2,
  },
};

const QUESTIONS: Question[] = [
  // ① 需要予測
  {
    id: "q1",
    section: "需要予測",
    text: "需要予測は定量データ（過去実績など）に基づいて行われている",
    driver: "forecast",
  },
  {
    id: "q2",
    section: "需要予測",
    text: "需要予測の精度を定期的に検証している",
    driver: "forecast",
  },
  {
    id: "q3",
    section: "需要予測",
    text: "季節性やトレンドを予測に反映できている",
    driver: "forecast",
  },
  {
    id: "q4",
    section: "需要予測",
    text: "営業・現場の感覚に依存せず予測ができている",
    driver: "forecast",
  },

  // ② 発注ロジック
  {
    id: "q5",
    section: "発注ロジック",
    text: "発注点・発注量がルールとして定義されている",
    driver: "replenishment",
  },
  {
    id: "q6",
    section: "発注ロジック",
    text: "発注は担当者の判断ではなくルールに基づいている",
    driver: "replenishment",
  },
  {
    id: "q7",
    section: "発注ロジック",
    text: "発注頻度が適切に設定されている",
    driver: "replenishment",
  },
  {
    id: "q8",
    section: "発注ロジック",
    text: "過剰発注・欠品の発生原因が分析されている",
    driver: "replenishment",
  },

  // ③ 安全在庫
  {
    id: "q9",
    section: "安全在庫",
    text: "安全在庫の設定根拠が明確である",
    driver: "safety_stock",
  },
  {
    id: "q10",
    section: "安全在庫",
    text: "安全在庫が定期的に見直されている",
    driver: "safety_stock",
  },
  {
    id: "q11",
    section: "安全在庫",
    text: "SKUごとに適切な安全在庫が設定されている",
    driver: "safety_stock",
  },
  {
    id: "q12",
    section: "安全在庫",
    text: "欠品率と在庫量のバランスが取れている",
    driver: "safety_stock",
  },

  // ④ SKU構成
  {
    id: "q13",
    section: "SKU構成",
    text: "SKU数が適切に管理されている",
    driver: "sku",
  },
  {
    id: "q14",
    section: "SKU構成",
    text: "売れないSKUが定期的に整理されている",
    driver: "sku",
  },
  {
    id: "q15",
    section: "SKU構成",
    text: "SKU追加時に在庫リスクを評価している",
    driver: "sku",
  },
  {
    id: "q16",
    section: "SKU構成",
    text: "SKUごとの回転率が把握されている",
    driver: "sku",
  },
  {
    id: "q17",
    section: "SKU構成",
    text: "ロングテールSKUが過剰に存在していない",
    driver: "sku",
  },

  // ⑤ リードタイム
  {
    id: "q18",
    section: "リードタイム",
    text: "仕入・製造リードタイムが把握されている",
    driver: "leadtime",
  },
  {
    id: "q19",
    section: "リードタイム",
    text: "リードタイムのばらつきを把握している",
    driver: "leadtime",
  },
  {
    id: "q20",
    section: "リードタイム",
    text: "リードタイム短縮の取り組みを行っている",
    driver: "leadtime",
  },
  {
    id: "q21",
    section: "リードタイム",
    text: "サプライヤーごとの差異を管理している",
    driver: "leadtime",
  },

  // ⑥ 在庫可視化
  {
    id: "q22",
    section: "在庫可視化",
    text: "在庫数量がリアルタイムまたは日次で把握できる",
    driver: "visibility",
  },
  {
    id: "q23",
    section: "在庫可視化",
    text: "在庫金額が把握できている",
    driver: "visibility",
  },
  {
    id: "q24",
    section: "在庫可視化",
    text: "SKU別の在庫状況が可視化されている",
    driver: "visibility",
  },
  {
    id: "q25",
    section: "在庫可視化",
    text: "在庫の滞留・過剰が把握できている",
    driver: "visibility",
  },

  // ⑦ 在庫精度
  {
    id: "q26",
    section: "在庫精度",
    text: "棚卸差異が低水準に抑えられている",
    driver: "accuracy",
  },
  {
    id: "q27",
    section: "在庫精度",
    text: "棚卸が定期的に実施されている",
    driver: "accuracy",
  },
  {
    id: "q28",
    section: "在庫精度",
    text: "在庫データと実在庫の一致率が高い",
    driver: "accuracy",
  },
  {
    id: "q29",
    section: "在庫精度",
    text: "入出庫ミスが管理・改善されている",
    driver: "accuracy",
  },
  {
    id: "q30",
    section: "在庫精度",
    text: "在庫管理ルールが現場で徹底されている",
    driver: "accuracy",
  },

  // ⑧ 在庫状態（結果指標）
  {
    id: "q31",
    section: "在庫状態",
    text: "在庫回転率を把握している",
    driver: "visibility",
  },
  {
    id: "q32",
    section: "在庫状態",
    text: "在庫月数（何ヶ月分）を把握している",
    driver: "visibility",
  },
  {
    id: "q33",
    section: "在庫状態",
    text: "滞留在庫（一定期間動かない在庫）の比率を把握している",
    driver: "visibility",
  },
  {
    id: "q34",
    section: "在庫状態",
    text: "欠品率を把握している",
    driver: "safety_stock",
  },
];

const SECTION_ORDER = [
  "需要予測",
  "発注ロジック",
  "安全在庫",
  "SKU構成",
  "リードタイム",
  "在庫可視化",
  "在庫精度",
  "在庫状態",
] as const;

type Option = {
  label: string;
  score: number;
};

const OPTIONS: Option[] = [
  { label: "十分できている", score: 1 },
  { label: "一部できている", score: 0 },
  { label: "課題あり", score: -1 },
  { label: "大きな課題", score: -2 },
  { label: "不明", score: 0 },
];

function getImprovementRate(score: number) {
  if (score <= -1.5) return 0.1;
  if (score <= -1.0) return 0.07;
  if (score <= -0.5) return 0.05;
  if (score <= 0) return 0.03;
  return 0.02;
}

export default function InventoryDiagnosticPage() {
  const router = useRouter();
  const [businessType, setBusinessType] =
    useState<BusinessType>("manufacturing");
  const [inventoryOku, setInventoryOku] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      QUESTIONS.map((q) => [q.id, 1])
    )
  );

  const groupedQuestions = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      items: QUESTIONS.filter((q) => q.section === section),
    }));
  }, []);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    const inventoryOkuNum = Number(inventoryOku);
    const inventoryAmount =
      Number.isFinite(inventoryOkuNum) && inventoryOkuNum > 0
        ? inventoryOkuNum * 100000000
        : 0;

    if (!inventoryAmount) {
      alert("在庫金額（億円）を入力してください。");
      return;
    }

    const driverQuestionMap: Record<DriverKey, number[]> = {
      forecast: [],
      replenishment: [],
      safety_stock: [],
      sku: [],
      leadtime: [],
      visibility: [],
      accuracy: [],
    };

    QUESTIONS.forEach((q) => {
      const idx = answers[q.id] ?? 1;
      const score = OPTIONS[idx]?.score ?? 0;
      driverQuestionMap[q.driver].push(score);
    });

    const weightedDriverScores = Object.entries(driverQuestionMap).map(
      ([driver, scores]) => {
        const rawAverage =
          scores.length > 0
            ? scores.reduce((sum, current) => sum + current, 0) / scores.length
            : 0;

        const weight = WEIGHTS[businessType][driver as DriverKey];
        const weightedScore = rawAverage * weight;

        return {
          key: driver as DriverKey,
          label: DRIVER_LABELS[driver as DriverKey],
          rawAverage,
          weight,
          weightedScore,
          comment: DRIVER_COMMENTS[driver as DriverKey],
        };
      }
    );

    const totalScore =
      weightedDriverScores.reduce((sum, d) => sum + d.weightedScore, 0) /
      weightedDriverScores.length;

    const improvementRate = getImprovementRate(totalScore);
    const improvementAmount = inventoryAmount * improvementRate;

    const topDrivers = [...weightedDriverScores]
      .sort((a, b) => a.weightedScore - b.weightedScore)
      .slice(0, 3);

    const priorityAction = PRIORITY_ACTIONS[topDrivers[0].key];

    const payload = {
      businessType,
      inventoryOku: inventoryOkuNum,
      improvementRate,
      improvementAmount,
      topDrivers,
      priorityAction,
    };

    router.push(`/inventory/result?data=${encodeURIComponent(JSON.stringify(payload))}`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0A2643]">
      <header className="border-b-4 border-[#CEC1A1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <img
            src="/logo.png"
            alt="ダイスリンク株式会社"
            className="h-10 w-auto"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const next = target.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }}
          />
          <div
            className="hidden text-sm font-medium tracking-wide text-[#0A2643]"
            style={{ display: "none" }}
          >
            ダイスリンク株式会社
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            在庫削減診断
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            在庫運営の構造をもとに、在庫削減ポテンシャルと主要な改善論点を可視化します。
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-lg font-semibold">基本情報</div>

          <div className="mb-8">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              主な業種
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { value: "manufacturing", label: "製造" },
                { value: "wholesale", label: "卸" },
                { value: "retail", label: "小売" },
                { value: "ec", label: "EC" },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    businessType === item.value
                      ? "border-[#CEC1A1] bg-[#0A2643] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#CEC1A1]"
                  }`}
                >
                  <input
                    type="radio"
                    name="businessType"
                    value={item.value}
                    checked={businessType === item.value}
                    onChange={() => setBusinessType(item.value as BusinessType)}
                    className="hidden"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              在庫金額（億円）
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="例：20"
              value={inventoryOku}
              onChange={(e) => setInventoryOku(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2643]"
            />
            <div className="mt-2 text-sm text-slate-500">
              例：20 と入力した場合、在庫金額20億円として計算します。
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {groupedQuestions.map((group) => (
            <section
              key={group.section}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 border-l-4 border-[#CEC1A1] pl-4 text-xl font-semibold">
                {group.section}
              </div>

              <div className="space-y-6">
                {group.items.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-100 p-5">
                    <div className="mb-4 text-sm font-semibold text-slate-800">
                      {q.id.replace("q", "Q")}
                      {`. `}
                      {q.text}
                    </div>

                    <div className="grid gap-2 md:grid-cols-5">
                      {OPTIONS.map((option, i) => {
                        const optionId = `${q.id}-${i}`;
                        const checked = answers[q.id] === i;

                        return (
                          <label
                            key={optionId}
                            htmlFor={optionId}
                            className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm transition ${
                              checked
                                ? "border-[#CEC1A1] bg-[#0A2643] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#CEC1A1]"
                            }`}
                          >
                            <input
                              id={optionId}
                              type="radio"
                              name={q.id}
                              value={i}
                              checked={checked}
                              onChange={() => handleAnswerChange(q.id, i)}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 mt-10 border-t border-[#CEC1A1] bg-white/95 py-6 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="text-sm leading-7 text-slate-600">
              入力完了後、在庫削減ポテンシャルと主要論点を算出します。
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-[#0A2643] px-8 py-4 text-white transition hover:opacity-90"
            >
              診断結果を表示する
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
