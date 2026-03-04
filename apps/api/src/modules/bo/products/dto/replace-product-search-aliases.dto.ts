import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductSearchAliasItemDto {
  @ApiProperty({ example: '여행용 워시백' })
  aliasText!: string;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;
}

export class ReplaceProductSearchAliasesDto {
  @ApiProperty({ type: [ReplaceProductSearchAliasItemDto] })
  aliases!: ReplaceProductSearchAliasItemDto[];
}
