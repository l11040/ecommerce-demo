import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('FO')
@Controller('fo')
export class FoController {
  @Get('health')
  @ApiOperation({ summary: 'Front Office health check' })
  healthCheck() {
    return { scope: 'fo', status: 'ok' };
  }
}
