import { ApiProperty } from '@nestjs/swagger';

export class FoLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  password!: string;
}
