import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    example: 1,
    description: '상위 카테고리 ID (없으면 depth=1)',
  })
  parentId?: number;

  @ApiProperty({ example: 'Electronics' })
  name!: string;

  @ApiProperty({ example: 'electronics' })
  slug!: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  isVisible?: boolean;

  @ApiPropertyOptional({ example: false })
  isMainExposed?: boolean;
}
