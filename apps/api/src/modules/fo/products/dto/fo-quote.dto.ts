import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FoQuoteDto {
  @ApiProperty({ example: 3000, minimum: 1 })
  quantity!: number;

  @ApiPropertyOptional({ example: 'guest', enum: ['guest', 'member'] })
  customerSegment?: string;

  @ApiPropertyOptional({ example: [10, 12], type: [Number] })
  selectedOptionItemIds?: number[];
}
