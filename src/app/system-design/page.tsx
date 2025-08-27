"use client";

import { Suspense } from "react";
import { DocsLayout } from "@/components/layout/DocsLayout";

export default function SystemDesign() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsLayout
        title="System Design"
        description="Learn to design scalable systems with real-world examples"
        category="system-design"
      />
    </Suspense>
  );
}