import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertProductDescriptionDto {
  @ApiProperty({ example: '<p>상품 상세 설명</p>' })
  descriptionHtmlRaw!: string;

  @ApiPropertyOptional({ example: '<p>상품 상세 설명</p>' })
  descriptionHtmlSanitized?: string;
}
