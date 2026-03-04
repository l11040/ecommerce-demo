import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    nullable: true,
    description: '상위 카테고리 ID (null이면 depth=1 루트)',
  })
  parentId?: number | null;

  @ApiPropertyOptional({ example: 'Electronics' })
  name?: string;

  @ApiPropertyOptional({ example: 'electronics' })
  slug?: string;

  @ApiPropertyOptional({ example: 10 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  isVisible?: boolean;

  @ApiPropertyOptional({ example: false })
  isMainExposed?: boolean;
}
