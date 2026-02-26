import { ApiProperty } from '@nestjs/swagger';

export class BoLoginDto {
  @ApiProperty({ example: 'test' })
  username!: string;

  @ApiProperty({ example: 'test' })
  password!: string;
}
