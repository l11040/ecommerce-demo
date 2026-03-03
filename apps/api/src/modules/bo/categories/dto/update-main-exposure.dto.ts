import { ApiProperty } from '@nestjs/swagger';

export class UpdateMainExposureDto {
  @ApiProperty({ example: true })
  isMainExposed!: boolean;
}
