import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";

type EventImageProps = {
  src: string | null;
  alt: string;
  size: number;
  className?: string;
};

const passthroughLoader = ({ src }: ImageLoaderProps): string => src;

export function EventImage({ src, alt, size, className }: EventImageProps) {
  const [isImageBroken, setIsImageBroken] = useState(false);
  const mergedClassName = className ?? "shrink-0 rounded-lg object-cover";
  const sizeStyle = { width: size, height: size };

  if (!src || isImageBroken) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
        style={sizeStyle}
      >
        PM
      </div>
    );
  }

  return (
    <Image
      loader={passthroughLoader}
      unoptimized
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={mergedClassName}
      style={sizeStyle}
      onError={() => setIsImageBroken(true)}
    />
  );
}
