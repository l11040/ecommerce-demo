import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('BO')
@Controller('bo')
export class BoController {
  @Get('health')
  @ApiOperation({ summary: 'Back Office health check' })
  healthCheck() {
    return { scope: 'bo', status: 'ok' };
  }
}
