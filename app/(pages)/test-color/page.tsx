"use client";

import { useState } from "react";
import AppColor from "@/app/components/inputs/AppColor";

export default function TestColorPage() {
    const [color, setColor] = useState("#4f46e5");

    return (
        <div className="p-10 flex flex-col gap-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold">Teste AppColor</h1>
            
            <AppColor 
                label="Cor Principal"
                value={color}
                onChange={setColor}
            />

            <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-500 font-medium">Cor Selecionada:</p>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div 
                        className="w-12 h-12 rounded-lg shadow-inner border border-slate-200"
                        style={{ backgroundColor: color }}
                    />
                    <div>
                        <p className="text-lg font-mono font-bold uppercase">{color}</p>
                    </div>
                </div>
            </div>

            <AppColor 
                label="Cor Secundária (Vazia)"
                placeholder="Selecione a cor secundária..."
            />

            <AppColor 
                label="Cor com Erro"
                value="#ff0000"
                error="Esta cor não é permitida"
            />

            <AppColor 
                label="Cor Desabilitada"
                value="#cccccc"
                disabled
            />
        </div>
    );
}
