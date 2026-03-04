import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplaceProductMediaItemDto {
  @ApiPropertyOptional({
    example: 'image',
    enum: ['image', 'video', 'file'],
  })
  type?: string;

  @ApiPropertyOptional({
    example: 'internal',
    enum: ['internal', 'external'],
  })
  sourceType?: string;

  @ApiProperty({
    example: '/uploads/products/2026/03/03/1700000000000-example.png',
  })
  url!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '대표 이미지',
  })
  altText?: string | null;

  @ApiPropertyOptional({ example: 0 })
  sortOrder?: number;
}

export class ReplaceProductMediaDto {
  @ApiProperty({ type: [ReplaceProductMediaItemDto] })
  media!: ReplaceProductMediaItemDto[];
}
