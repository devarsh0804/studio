"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot } from "@/lib/types";
import { RegisterCropForm } from "./RegisterCropForm";

export function RegisterCropFormWithPersistence() {
    const { addLot } = useAgriChainStore(
        (state) => ({ addLot: state.addLot })
    );

    const handleRegister = (lot: Lot) => {
        addLot(lot);
    };

    return <RegisterCropForm onRegister={handleRegister} />;
}
