import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">診断ツール</h1>

      <Link
        href="/inventory"
        className="rounded-xl bg-[#0A2643] px-6 py-3 text-white"
      >
        在庫診断へ
      </Link>
    </main>
  );
}
