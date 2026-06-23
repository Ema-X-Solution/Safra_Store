"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Leaf } from "lucide-react";
import { getCategoryName, type Category } from "@/lib/types";
import type { Locale } from "@/i18n/routing";

export default function CategorySlider({ categories }: { categories: Category[] }) {
  const locale = useLocale() as Locale;

  return (
    <div className="w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Mousewheel]}
        autoplay={{
          delay: 2800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={600}
        spaceBetween={12}
        slidesPerView={3.2}
        grabCursor={true}
        mousewheel={{ forceToAxis: true }}
        breakpoints={{
          480:  { slidesPerView: 4.2, spaceBetween: 14 },
          768:  { slidesPerView: 5.2, spaceBetween: 16 },
          1024: { slidesPerView: 6,   spaceBetween: 16 },
          1280: { slidesPerView: 7,   spaceBetween: 16 },
        }}
        className="pb-4 pt-2 px-1 w-full mx-auto"
      >
        {categories.slice(0, 12).map((category) => (
          <SwiperSlide key={category.id} className="h-auto">
            <div className="h-full p-1.5">
              <Link
                href={`/categories/${category.id}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl bg-white border border-safra-taupe/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-safra-gold/30 h-full w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-safra-light/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className="w-full flex flex-col items-center justify-center text-center p-3 sm:p-4 gap-2 sm:gap-3 relative z-10">
                  {/* Image — fixed 150×150 */}
                  <div className="rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md flex-shrink-0"
                       style={{ width: 150, height: 150 }}>
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={getCategoryName(category, locale)}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-safra-light/30">
                        <Leaf className="h-10 w-10 text-safra-olive" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <h3 className="font-bold text-safra-dark text-xs sm:text-sm leading-tight group-hover:text-safra-olive transition-colors line-clamp-2">
                    {getCategoryName(category, locale)}
                  </h3>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
