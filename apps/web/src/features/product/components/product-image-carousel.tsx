'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { ProductMedia } from '../types';

interface ProductImageCarouselProps {
  media: ProductMedia[];
  thumbnailUrl: string | null;
  productName: string;
}

function ProductImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ImageOff className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, 50vw"
      priority={priority}
      onError={() => setError(true)}
    />
  );
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <ImageOff className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="80px"
      onError={() => setError(true)}
    />
  );
}

export function ProductImageCarousel({
  media,
  thumbnailUrl,
  productName,
}: ProductImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const images =
    media.length > 0
      ? media
          .filter((m) => m.type === 'image')
          .map((m) => ({ url: getImageUrl(m.url), alt: m.altText ?? productName }))
      : thumbnailUrl
        ? [{ url: getImageUrl(thumbnailUrl), alt: productName }]
        : [];

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
        <ImageOff className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <ProductImage
                  src={img.url}
                  alt={img.alt}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      <div className="grid grid-cols-5 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={cn(
              'relative aspect-square w-full overflow-hidden rounded-md border-2 transition-colors',
              selectedIndex === index
                ? 'border-primary'
                : 'border-transparent hover:border-muted-foreground/30',
            )}
          >
            <ThumbnailImage src={img.url} alt={img.alt} />
          </button>
        ))}
      </div>
    </div>
  );
}
