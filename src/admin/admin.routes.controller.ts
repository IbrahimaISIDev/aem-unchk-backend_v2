import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminRoutesController {
  @Get()
  @ApiOperation({ summary: 'Admin index' })
  root() { return { ok: true }; }

  @Get('users')
  @ApiOperation({ summary: 'Admin users index' })
  users() { return { ok: true }; }

  @Get('media')
  @ApiOperation({ summary: 'Admin media index' })
  media() { return { ok: true }; }

  @Get('events')
  @ApiOperation({ summary: 'Admin events index' })
  events() { return { ok: true }; }

  @Get('products')
  @ApiOperation({ summary: 'Admin products index' })
  products() { return { ok: true }; }
}