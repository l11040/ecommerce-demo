import { ApiProperty } from '@nestjs/swagger';

export class FoRefreshTokenDto {
  @ApiProperty()
  refreshToken!: string;
}
