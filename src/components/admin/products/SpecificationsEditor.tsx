"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ProductSpecification } from "@/lib/types";

interface SpecificationsEditorProps {
  specs: ProductSpecification[];
  onChange: (specs: ProductSpecification[]) => void;
}

export default function SpecificationsEditor({ specs, onChange }: SpecificationsEditorProps) {
  const handleAdd = () => {
    onChange([...specs, { key: { en: "", ar: "" }, value: { en: "", ar: "" } }]);
  };

  const handleRemove = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: "key" | "value", locale: "en" | "ar", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field][locale] = val;
    onChange(newSpecs);
  };

  return (
    <div className="space-y-4">
      {specs.map((spec, i) => (
        <div key={i} className="relative rounded-xl border border-safra-taupe/40 bg-safra-cream/20 p-4 pt-8">
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="absolute right-2 top-2 rounded-md p-1 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Key (e.g. Weight)"
                value={spec.key.en}
                onChange={(e) => handleChange(i, "key", "en", e.target.value)}
                className="w-full rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:border-safra-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g. 500g)"
                value={spec.value.en}
                onChange={(e) => handleChange(i, "value", "en", e.target.value)}
                className="w-full rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:border-safra-gold focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="المفتاح (مثال: الوزن)"
                value={spec.key.ar}
                onChange={(e) => handleChange(i, "key", "ar", e.target.value)}
                dir="rtl"
                className="w-full rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:border-safra-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="القيمة (مثال: 500 غرام)"
                value={spec.value.ar}
                onChange={(e) => handleChange(i, "value", "ar", e.target.value)}
                dir="rtl"
                className="w-full rounded-lg border border-safra-taupe/40 px-3 py-2 text-sm focus:border-safra-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-safra-gold bg-safra-gold/10 px-4 py-3 text-sm font-semibold text-safra-deep-gold hover:bg-safra-gold/20 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Specification
      </button>
    </div>
  );
}
