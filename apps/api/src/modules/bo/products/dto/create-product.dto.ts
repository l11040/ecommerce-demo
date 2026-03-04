import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 1 })
  storeId!: number;

  @ApiPropertyOptional({ type: Number, example: 1001, nullable: true })
  categoryId?: number | null;

  @ApiProperty({ example: 'N트래블 엔보우 워시백' })
  name!: string;

  @ApiProperty({ example: 'ntravel-washbag-22x18x9' })
  slug!: string;

  @ApiPropertyOptional({
    example: 'draft',
    enum: ['draft', 'published', 'soldout', 'stopped'],
  })
  status?: string;

  @ApiPropertyOptional({ example: false })
  isVisible?: boolean;

  @ApiPropertyOptional({ example: 30, minimum: 1 })
  moq?: number;

  @ApiPropertyOptional({ example: false })
  moqInquiryOnly?: boolean;

  @ApiPropertyOptional({ example: 4200 })
  baseSupplyCost?: number;

  @ApiPropertyOptional({
    example: 'exclusive',
    enum: ['exclusive', 'inclusive'],
  })
  vatType?: string;

  @ApiPropertyOptional({ example: 10 })
  vatRate?: number;

  @ApiPropertyOptional({ example: true })
  isPrintable?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: '실크 1도 인쇄(흰색)',
    nullable: true,
  })
  printMethod?: string | null;

  @ApiPropertyOptional({ type: String, example: '80 x 70 mm', nullable: true })
  printArea?: string | null;

  @ApiPropertyOptional({ type: Number, example: 4, nullable: true })
  proofLeadTimeDays?: number | null;

  @ApiPropertyOptional({
    type: String,
    example: 'https://cdn.example.com/products/washbag/main.jpg',
    nullable: true,
  })
  thumbnailUrl?: string | null;
}
