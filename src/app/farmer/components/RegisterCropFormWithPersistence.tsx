"use client";

import type { Lot } from "@/lib/types";
import { RegisterCropForm } from "./RegisterCropForm";

interface RegisterCropFormWithPersistenceProps {
  onRegister: (lot: Lot) => void;
}

export function RegisterCropFormWithPersistence({ onRegister }: RegisterCropFormWithPersistenceProps) {
    return <RegisterCropForm onRegister={onRegister} />;
}
