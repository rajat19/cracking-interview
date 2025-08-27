"use client";

import { Suspense } from "react";
import { DocsLayout } from "@/components/layout/DocsLayout";

export default function OOD() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsLayout
        title="Object-Oriented Design"
        description="Master OOP principles and design patterns for technical interviews"
        category="ood"
      />
    </Suspense>
  );
}