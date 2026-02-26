import { ApiProperty } from '@nestjs/swagger';

export class FoSocialLoginDto {
  @ApiProperty({ example: 'google', description: 'social provider key' })
  provider!: string;

  @ApiProperty({ example: 'social-access-token' })
  accessToken!: string;
}
