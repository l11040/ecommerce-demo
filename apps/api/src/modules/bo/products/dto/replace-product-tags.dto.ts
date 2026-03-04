import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductTagItemDto {
  @ApiProperty({ example: '판촉물' })
  tag!: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;
}

export class ReplaceProductTagsDto {
  @ApiProperty({ type: [ReplaceProductTagItemDto] })
  tags!: ReplaceProductTagItemDto[];
}
