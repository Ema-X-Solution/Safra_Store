import Input from "@/components/ui/Input";

interface BilingualInputProps {
  nameEn: string;
  nameAr: string;
  label: string;
  defaultValueEn?: string;
  defaultValueAr?: string;
  required?: boolean;
}

export default function BilingualInput({ nameEn, nameAr, label, defaultValueEn, defaultValueAr, required }: BilingualInputProps) {
  return (
    <div className="space-y-4 rounded-xl border border-safra-taupe/40 bg-safra-cream/20 p-4">
      <h4 className="text-sm font-semibold text-safra-dark">{label}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name={nameEn} label="English" defaultValue={defaultValueEn} required={required} />
        <Input name={nameAr} label="Arabic" defaultValue={defaultValueAr} required={required} dir="rtl" />
      </div>
    </div>
  );
}
