"use client";

import { useState } from "react";
import type { Lot, GradedLot } from "@/lib/types";
import { useGradedLotsStore } from "@/hooks/use-graded-lots-store";
import { GradingForm } from "./GradingForm";
import { CertificateDisplay } from "./CertificateDisplay";

export function GradingView() {
  const [gradedLot, setGradedLot] = useState<GradedLot | null>(null);
  const { addLot } = useGradedLotsStore();

  const handleGrade = (lot: GradedLot) => {
    addLot(lot);
    setGradedLot(lot);
  };

  const handleGradeNew = () => {
    setGradedLot(null);
  };
  
  if (gradedLot) {
    return <CertificateDisplay lot={gradedLot} onGradeNew={handleGradeNew} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <GradingForm onGrade={handleGrade} />
    </div>
  );
}
