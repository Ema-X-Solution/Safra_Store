"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { type Product, type Category } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";

interface ProductSliderProps {
  products: Product[];
  categories: Category[];
  speed?: number;
}

export default function ProductSlider({ products, categories, speed = 3200 }: ProductSliderProps) {
  if (!products.length) return null;

  return (
    <div className="w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Mousewheel]}
        autoplay={{
          delay: speed,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={products.length > 2}
        speed={700}
        spaceBetween={12}
        slidesPerView={2.2}
        grabCursor={true}
        mousewheel={{ forceToAxis: true }}
        breakpoints={{
          480:  { slidesPerView: 2.3, spaceBetween: 14 },
          640:  { slidesPerView: 2.6, spaceBetween: 16 },
          768:  { slidesPerView: 3.2, spaceBetween: 16 },
          1024: { slidesPerView: 4,   spaceBetween: 20 },
          1280: { slidesPerView: 4,   spaceBetween: 24 },
        }}
        style={{ width: "100%" }}
        className="pb-6 pt-2 px-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <div className="h-full p-1.5">
              <ProductCard
                product={product}
                category={categories.find((c) => c.id === product.categoryId)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
