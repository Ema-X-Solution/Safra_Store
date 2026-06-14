import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  langValidate?: "en" | "ar";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error: externalError, id, type, langValidate, onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [showPassword, setShowPassword] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            className={cn(
              "w-full rounded-lg border border-safra-taupe bg-white px-4 py-2.5 text-safra-dark",
              "placeholder:text-safra-muted",
              "focus:border-safra-gold focus:outline-none focus:ring-2 focus:ring-safra-gold/30",
              "transition-colors duration-200",
              isPassword && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              className
            )}
            onChange={handleChange}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-safra-muted hover:text-safra-dark transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
