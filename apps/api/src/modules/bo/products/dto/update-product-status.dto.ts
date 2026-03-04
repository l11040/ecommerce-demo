import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductStatusDto {
  @ApiProperty({
    example: 'published',
    enum: ['draft', 'published', 'soldout', 'stopped'],
  })
  status!: string;
}
