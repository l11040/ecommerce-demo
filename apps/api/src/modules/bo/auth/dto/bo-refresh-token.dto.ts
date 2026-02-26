import { ApiProperty } from '@nestjs/swagger';

export class BoRefreshTokenDto {
  @ApiProperty()
  refreshToken!: string;
}
