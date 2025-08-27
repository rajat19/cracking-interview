"use client";

import { Suspense } from "react";
import { DocsLayout } from "@/components/layout/DocsLayout";

export default function DSA() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsLayout
        title="Data Structures & Algorithms"
        description="Master coding interviews with comprehensive DSA topics"
        category="dsa"
      />
    </Suspense>
  );
}