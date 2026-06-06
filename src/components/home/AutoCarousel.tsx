"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

export default function AutoCarousel({
  children,
  className,
  speed = 3500,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isHovered) return;

    const scrollNext = () => {
      // Find the exact width of the first visible child including gaps
      const childWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 300;
      const gap = parseInt(window.getComputedStyle(el).gap) || 0;
      const scrollStep = childWidth + gap;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const currentScroll = Math.abs(el.scrollLeft);
      
      if (currentScroll >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const direction = isRtl ? -1 : 1;
        el.scrollBy({ left: scrollStep * direction, behavior: "smooth" });
      }
    };

    const interval = setInterval(scrollNext, speed);
    return () => clearInterval(interval);
  }, [speed, isHovered, isRtl]);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className={cn(
        "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide",
        className
      )}
      style={{ scrollBehavior: "smooth" }}
    >
      {children}
    </div>
  );
}
