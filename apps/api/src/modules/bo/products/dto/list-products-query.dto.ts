import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListProductsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  storeId?: string;

  @ApiPropertyOptional({ example: 1001 })
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'published',
    enum: ['draft', 'published', 'soldout', 'stopped'],
  })
  status?: string;

  @ApiPropertyOptional({ example: 'true', enum: ['true', 'false'] })
  isVisible?: string;

  @ApiPropertyOptional({ example: '워시백' })
  keyword?: string;

  @ApiPropertyOptional({ example: 30 })
  minMoq?: string;

  @ApiPropertyOptional({ example: 3000 })
  maxMoq?: string;
}
