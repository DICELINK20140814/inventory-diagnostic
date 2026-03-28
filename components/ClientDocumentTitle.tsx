"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TITLE = "在庫診断";

/**
 * metadata の HMR／キャッシュでタブ名が古いままになる場合に備え、
 * ルート遷移のたびに document.title を上書きする。
 */
export function ClientDocumentTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = TITLE;
  }, [pathname]);

  return null;
}
