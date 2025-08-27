"use client";

import { Suspense } from "react";
import { DocsLayout } from "@/components/layout/DocsLayout";

export default function Behavioral() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsLayout
        title="Behavioral"
        description="Ace behavioral interviews with proven frameworks and example scenarios"
        category="behavioral"
      />
    </Suspense>
  );
}