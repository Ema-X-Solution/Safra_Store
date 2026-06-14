import { TextareaHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  langValidate?: "en" | "ar";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error: externalError, id, langValidate, onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [internalError, setInternalError] = useState<string | undefined>();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (langValidate === "en") {
        if (/[\u0600-\u06FF]/.test(val)) {
          setInternalError("Only English characters are allowed in this field.");
          e.target.setCustomValidity("Only English characters are allowed");
        } else {
          setInternalError(undefined);
          e.target.setCustomValidity("");
        }
      } else if (langValidate === "ar") {
        if (/[A-Za-z]/.test(val)) {
          setInternalError("يسمح فقط بالأحرف العربية في هذا الحقل.");
          e.target.setCustomValidity("يسمح فقط بالأحرف العربية");
        } else {
          setInternalError(undefined);
          e.target.setCustomValidity("");
        }
      }
      onChange?.(e);
    };

    const error = externalError || internalError;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-safra-dark">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-safra-taupe bg-white px-4 py-2.5 text-safra-dark",
            "placeholder:text-safra-muted",
            "focus:border-safra-gold focus:outline-none focus:ring-2 focus:ring-safra-gold/30",
            "transition-colors duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
