"use client";

import Image from "next/image";
import { useState, useRef, MouseEvent } from "react";
import { ZoomIn } from "lucide-react";

interface ImageZoomHoverProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

/**
 * Componente per immagine con effetto zoom al passaggio del mouse
 * Mostra una lente d'ingrandimento che segue il cursore
 */
export function ImageZoomHover({ src, alt, onClick }: ImageZoomHoverProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, xPercent: 0, yPercent: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calcola posizione in pixel dal bordo del container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calcola posizione in percentuale per background-position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setPosition({ x, y, xPercent, yPercent });
  };

  return (
    <div
      ref={containerRef}
      className="group relative h-96 w-full cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Immagine principale */}
      <div ref={imageRef} className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain transition-transform"
        />
      </div>

      {/* Lente d'ingrandimento al passaggio del mouse */}
      {isHovering && (() => {
        const scale = 2.5;

        return (
          <div
            className="pointer-events-none absolute h-40 w-40 overflow-hidden rounded-full border-4 border-wine-600 shadow-2xl bg-white"
            style={{
              left: position.x,
              top: position.y,
              transform: "translate(-50%, -50%)",
              backgroundImage: `url(${src})`,
              backgroundSize: `${scale * 100}%`,
              backgroundPosition: `${position.xPercent}% ${position.yPercent}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        );
      })()}

      {/* Overlay con icona zoom */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-10">
        <div className="rounded-full bg-white p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-90">
          <ZoomIn className="h-6 w-6 text-wine-600" />
        </div>
      </div>
    </div>
  );
}
