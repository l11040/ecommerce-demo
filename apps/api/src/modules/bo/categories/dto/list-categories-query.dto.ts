import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListCategoriesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  parentId?: number;

  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 4 })
  depth?: number;

  @ApiPropertyOptional({ example: 'true' })
  isActive?: 'true' | 'false';

  @ApiPropertyOptional({ example: 'true' })
  isVisible?: 'true' | 'false';

  @ApiPropertyOptional({ example: 'true' })
  isMainExposed?: 'true' | 'false';
}
