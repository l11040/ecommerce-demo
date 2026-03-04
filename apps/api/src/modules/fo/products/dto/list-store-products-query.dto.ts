import { ApiPropertyOptional } from '@nestjs/swagger';

export class FoListStoreProductsQueryDto {
  @ApiPropertyOptional({ example: 1001 })
  categoryId?: string;

  @ApiPropertyOptional({ example: '워시백' })
  keyword?: string;

  @ApiPropertyOptional({ example: 30 })
  minMoq?: string;

  @ApiPropertyOptional({ example: 3000 })
  maxMoq?: string;
}
