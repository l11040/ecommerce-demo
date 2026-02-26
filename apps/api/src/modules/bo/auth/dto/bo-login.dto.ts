import { ApiProperty } from '@nestjs/swagger';

export class BoLoginDto {
  @ApiProperty({ example: 'admin_master' })
  username!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  password!: string;
}
