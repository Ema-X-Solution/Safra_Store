import OmrIcon from "@/components/ui/OmrIcon";
import { cn, formatPrice } from "@/lib/utils";

export default function Price({
  amount,
  className,
  iconClassName,
}: {
  amount: number;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span>{formatPrice(amount)}</span>
      <OmrIcon className={cn("shrink-0", iconClassName)} />
    </span>
  );
}

