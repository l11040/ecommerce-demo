import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductPriceTierDto {
  @ApiProperty({ example: 30, minimum: 1 })
  minQty!: number;

  @ApiProperty({ example: 31, minimum: 0, maximum: 100 })
  marginRate!: number;

  @ApiPropertyOptional({ type: Number, example: 6075, nullable: true })
  unitPriceOverride?: number | null;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

export class ReplaceProductPriceTiersDto {
  @ApiProperty({ type: [ReplaceProductPriceTierDto] })
  guest!: ReplaceProductPriceTierDto[];

  @ApiProperty({ type: [ReplaceProductPriceTierDto] })
  member!: ReplaceProductPriceTierDto[];
}
