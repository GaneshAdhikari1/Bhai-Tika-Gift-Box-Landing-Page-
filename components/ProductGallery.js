"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCT } from "@/lib/product";
import Icon from "./Icon";

export default function ProductGallery() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((current) => (current + 1) % PRODUCT.images.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-card">
        {PRODUCT.images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`${PRODUCT.name} gallery view ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition duration-700 ${active === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setActive((active - 1 + PRODUCT.images.length) % PRODUCT.images.length)}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-plum shadow-lg backdrop-blur transition hover:bg-white"
        >
          <Icon name="chevron" className="h-5 w-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => setActive((active + 1) % PRODUCT.images.length)}
          aria-label="Next image"
          className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-plum shadow-lg backdrop-blur transition hover:bg-white"
        >
          <Icon name="chevron" className="h-5 w-5" />
        </button>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-ink/30 px-3 py-2 backdrop-blur">
          {PRODUCT.images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${active === index ? "w-7 bg-white" : "w-2 bg-white/55"}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
        {PRODUCT.images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Select image ${index + 1}`}
            onClick={() => setActive(index)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${active === index ? "border-plum shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
          >
            <Image src={image} alt="" fill sizes="120px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
