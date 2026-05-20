import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "placeholder"> {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder: string; // base64 data URL
  alt: string;
  imgClassName?: string;
  wrapperClassName?: string;
  eager?: boolean;
}

const BlurImage = ({
  src,
  srcSet,
  sizes,
  placeholder,
  alt,
  imgClassName,
  wrapperClassName,
  eager = false,
  width,
  height,
  ...rest
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      {/* Blurred placeholder */}
      <img
        src={placeholder}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full object-cover scale-110 blur-xl transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName
        )}
        {...rest}
      />
    </div>
  );
};

export default BlurImage;
