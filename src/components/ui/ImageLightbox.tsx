"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type ImageLightboxProps = {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
};

export function ImageLightbox({
  src,
  alt,
  className = "",
  thumbnailClassName = "h-full w-full object-cover cursor-pointer transition-opacity hover:opacity-90",
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block w-full outline-none ${className}`}
        aria-label={`Ampliar ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={thumbnailClassName}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-punk-black/95 p-4 pt-20"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center border-2 border-punk-white/40 text-punk-white transition-colors hover:border-punk-red hover:text-punk-red"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
          <div
            className="relative flex max-h-[calc(100vh-6rem)] max-w-[min(90vw,800px)] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[calc(100vh-6rem)] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
