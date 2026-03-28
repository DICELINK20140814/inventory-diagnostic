"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Driver = {
  key: string;
  label: string;
  rawAverage: number;
  weight: number;
  weightedScore: number;
  comment: string;
};

function formatOku(amount: number) {
  return `${(amount / 100000000).toFixed(1)}億円`;
}

function InventoryResultContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("data");

  if (!raw) {
    return (
      <main className="min-h-screen bg-white p-10 text-[#0A2643]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6">結果データが見つかりませんでした。</p>
          <Link
            href="/inventory"
            className="rounded-xl bg-[#0A2643] px-6 py-3 text-white"
          >
            診断画面に戻る
          </Link>
        </div>
      </main>
    );
  }

  const data = JSON.parse(decodeURIComponent(raw)) as {
    businessType: string;
    inventoryOku: number;
    improvementRate: number;
    improvementAmount: number;
    topDrivers: Driver[];
    priorityAction: string;
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
        <section className="mb-8 rounded-3xl border border-[#CEC1A1] bg-white p-8 shadow-sm">
          <div className="mb-2 text-sm font-semibold tracking-wide text-[#CEC1A1]">
            推定削減余地
          </div>
          <div className="mb-3 text-4xl font-bold md:text-5xl">
            {formatOku(data.improvementAmount)}
          </div>
          <div className="text-lg text-slate-600">
            在庫金額比 {(data.improvementRate * 100).toFixed(1)}%
          </div>
        </section>

        <section className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              在庫金額
            </div>
            <div className="text-2xl font-bold">{data.inventoryOku}億円</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              削減率
            </div>
            <div className="text-2xl font-bold">
              {(data.improvementRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              金額目安
            </div>
            <div className="text-2xl font-bold">
              {formatOku(data.improvementAmount)}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 text-2xl font-bold">主な改善論点</div>
          <div className="space-y-5">
            {data.topDrivers.map((driver, index) => (
              <div key={driver.key} className="rounded-xl border border-slate-100 p-5">
                <div className="mb-2 text-lg font-semibold">
                  {index + 1}. {driver.label}
                </div>
                <div className="text-base leading-8 text-slate-600">
                  {driver.comment}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-2xl font-bold">優先的に取り組むべき施策</div>
          <div className="text-base leading-8 text-slate-700">
            {data.priorityAction}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-3 text-lg font-semibold">注意書き</div>
          <div className="text-sm leading-7 text-slate-500">
            ※本診断結果はヒアリング内容に基づく簡易評価であり、
            実際の削減効果は詳細分析により変動します。
          </div>
        </section>

        <div className="flex gap-4">
          <Link
            href="/inventory"
            className="rounded-xl bg-[#0A2643] px-6 py-3 text-white transition hover:opacity-90"
          >
            入力画面に戻る
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#0A2643] px-6 py-3 text-[#0A2643] transition hover:bg-slate-50"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function InventoryResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8FAFC] p-10 text-[#0A2643]">
          <div className="mx-auto max-w-4xl text-slate-600">読み込み中…</div>
        </main>
      }
    >
      <InventoryResultContent />
    </Suspense>
  );
}
