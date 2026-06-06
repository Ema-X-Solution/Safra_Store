import OmrIcon from "@/components/ui/OmrIcon";
import { cn, formatPrice } from "@/lib/utils";

export default function Price({
  amount,
  className,
  iconClassName,
  strikethrough = false,
}: {
  amount: number;
  className?: string;
  iconClassName?: string;
  strikethrough?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 relative", className)}>
      <span className={strikethrough ? "opacity-70" : ""}>{formatPrice(amount)}</span>
      <OmrIcon className={cn("shrink-0", strikethrough ? "opacity-70" : "", iconClassName)} />
      {strikethrough && (
        <span className="absolute top-1/2 left-[-5%] w-[110%] h-[2px] bg-red-500/90 -translate-y-1/2 rotate-[-8deg] rounded-full z-10 pointer-events-none"></span>
      )}
    </span>
  );
}

