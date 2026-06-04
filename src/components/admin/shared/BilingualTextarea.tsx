interface BilingualTextareaProps {
  nameEn: string;
  nameAr: string;
  label: string;
  defaultValueEn?: string;
  defaultValueAr?: string;
  required?: boolean;
  rows?: number;
}

export default function BilingualTextarea({ nameEn, nameAr, label, defaultValueEn, defaultValueAr, required, rows = 4 }: BilingualTextareaProps) {
  return (
    <div className="space-y-4 rounded-xl border border-safra-taupe/40 bg-safra-cream/20 p-4">
      <h4 className="text-sm font-semibold text-safra-dark">{label}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-safra-dark">English</label>
          <textarea
            name={nameEn}
            defaultValue={defaultValueEn}
            required={required}
            rows={rows}
            className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold custom-scrollbar"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-safra-dark">Arabic</label>
          <textarea
            name={nameAr}
            defaultValue={defaultValueAr}
            required={required}
            rows={rows}
            dir="rtl"
            className="w-full rounded-lg border border-safra-taupe/40 bg-white px-3 py-2 text-safra-dark focus:border-safra-gold focus:outline-none focus:ring-1 focus:ring-safra-gold custom-scrollbar"
          />
        </div>
      </div>
    </div>
  );
}
