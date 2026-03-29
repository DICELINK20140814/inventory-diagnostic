'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0A2643] text-white flex flex-col">
      
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* ロゴ */}
          <Image
            src="/logo.png"
            alt="DICE LINK"
            width={140}
            height={40}
            priority
          />
        </div>
      </header>

      {/* メイン */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        
        {/* タイトル */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          在庫診断
        </h1>

        {/* サブ */}
        <p className="text-gray-300 mb-10 max-w-xl">
          在庫構造・回転率・滞留リスクを可視化し、
          改善余地とインパクトを算出します。
        </p>

        {/* ボタン */}
        <button
          onClick={() => router.push('/diagnosis')}
          className="bg-[#CEC1A1] text-[#0A2643] font-bold px-8 py-4 rounded-lg hover:opacity-90 transition"
        >
          診断を開始する
        </button>
      </section>

      {/* フッター */}
      <footer className="text-center text-xs text-gray-400 py-4">
        © DICE LINK Inc.
      </footer>
    </main>
  );
}
