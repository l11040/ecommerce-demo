import { ApiProperty } from '@nestjs/swagger';

export class FoLoginDto {
  @ApiProperty({ example: 'test@test.test' })
  email!: string;

  @ApiProperty({ example: 'test' })
  password!: string;
}
