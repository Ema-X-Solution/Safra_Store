interface BilingualTextareaProps {
  nameEn: string;
  nameAr: string;
  label: string;
  defaultValueEn?: string;
  defaultValueAr?: string;
  required?: boolean;
  rows?: number;
}

import Textarea from "@/components/ui/Textarea";

export default function BilingualTextarea({ nameEn, nameAr, label, defaultValueEn, defaultValueAr, required, rows = 4 }: BilingualTextareaProps) {
  return (
    <div className="space-y-4 rounded-xl border border-safra-taupe/40 bg-safra-cream/20 p-4">
      <h4 className="text-sm font-semibold text-safra-dark">{label}</h4>
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <Textarea
            name={nameEn}
            label="English"
            defaultValue={defaultValueEn}
            required={required}
            rows={rows}
            langValidate="en"
          />
        </div>
        <div className="flex-1 border-t border-safra-taupe/20 pt-4 sm:border-t-0 sm:pt-0">
          <Textarea
            name={nameAr}
            label="Arabic"
            defaultValue={defaultValueAr}
            required={required}
            rows={rows}
            dir="rtl"
            langValidate="ar"
          />
        </div>
      </div>
    </div>
  );
}
