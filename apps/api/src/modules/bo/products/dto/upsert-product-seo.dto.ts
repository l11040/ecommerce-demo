import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertProductSeoDto {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'N트래블 워시백 | 판촉물',
  })
  metaTitle?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'N트래블 엔보우 워시백 상품 상세',
  })
  metaDescription?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '워시백,판촉물,굿즈',
  })
  metaKeywords?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://example.com/products/ntravel-washbag',
  })
  canonicalUrl?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'index,follow',
  })
  robots?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'N트래블 워시백 OG 제목',
  })
  ogTitle?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'N트래블 워시백 OG 설명',
  })
  ogDescription?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://cdn.example.com/products/washbag/og-image.jpg',
  })
  ogImage?: string | null;
}
