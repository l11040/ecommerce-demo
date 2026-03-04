import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductSpecDto {
  @ApiProperty({ example: '제품크기' })
  label!: string;

  @ApiProperty({ example: '220 x 180 x 90 mm' })
  value!: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;
}

class ReplaceProductSpecGroupDto {
  @ApiProperty({ example: '기본정보' })
  name!: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;

  @ApiProperty({ type: [ReplaceProductSpecDto] })
  specs!: ReplaceProductSpecDto[];
}

export class ReplaceProductSpecsDto {
  @ApiProperty({ type: [ReplaceProductSpecGroupDto] })
  specGroups!: ReplaceProductSpecGroupDto[];
}
