import { Module } from '@nestjs/common';
import { AdminRoutesController } from './admin.routes.controller';

@Module({
  controllers: [AdminRoutesController],
})
export class AdminModule {}