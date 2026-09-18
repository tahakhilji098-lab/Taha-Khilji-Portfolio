import React from 'react';
import {
  OptimizedImage,
  getOptimizedImage,
} from '../assets/optimized/images';

interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  /** Original image path — used as the fallback <img src>. */
  src: string;
  /** Rendered width in CSS pixels per breakpoint. */
  sizes: string;
  /** Optimized variant record; renders a plain <img> when unavailable. */
  image?: OptimizedImage;
  /** React 19 fetch priority hint. */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Responsive raster image: AVIF → WebP → original fallback with intrinsic
 * dimensions to reduce layout shift. Pass `image={getOptimizedImage(src)}`
 * to serve optimized variants; the fallback keeps existing styling intact.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  sizes,
  image,
  alt,
  loading = 'lazy',
  decoding = 'async',
  width,
  height,
  className,
  style,
  fetchPriority,
  ...rest
}) => {
  if (image) {
    return (
      <picture>
        <source type="image/avif" srcSet={image.avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
        <img
          {...rest}
          src={src}
          alt={alt}
          sizes={sizes}
          width={width ?? image.width}
          height={height ?? image.height}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          className={className}
          style={style}
        />
      </picture>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      sizes={sizes}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      className={className}
      style={style}
    />
  );
};