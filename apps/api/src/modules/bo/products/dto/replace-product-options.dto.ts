import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductOptionItemDto {
  @ApiProperty({ example: '그레이' })
  label!: string;

  @ApiPropertyOptional({ example: 0 })
  extraSupplyCost?: number;

  @ApiPropertyOptional({ example: 0 })
  extraUnitPrice?: number;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

class ReplaceProductOptionGroupDto {
  @ApiProperty({ example: '제품 색상 선택' })
  name!: string;

  @ApiPropertyOptional({ example: true })
  isRequired?: boolean;

  @ApiPropertyOptional({ example: 'single', enum: ['single', 'multi'] })
  selectionType?: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiProperty({ type: [ReplaceProductOptionItemDto] })
  items!: ReplaceProductOptionItemDto[];
}

export class ReplaceProductOptionsDto {
  @ApiProperty({ type: [ReplaceProductOptionGroupDto] })
  optionGroups!: ReplaceProductOptionGroupDto[];
}
