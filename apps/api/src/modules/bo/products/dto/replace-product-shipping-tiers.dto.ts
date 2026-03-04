import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductShippingTierDto {
  @ApiProperty({ example: 30, minimum: 1 })
  minQty!: number;

  @ApiProperty({ example: 3000, minimum: 0 })
  shippingFee!: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

export class ReplaceProductShippingTiersDto {
  @ApiProperty({ type: [ReplaceProductShippingTierDto] })
  shippingTiers!: ReplaceProductShippingTierDto[];
}
