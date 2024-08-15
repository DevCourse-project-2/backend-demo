// src/bike/bike.module.ts

import { Module } from '@nestjs/common';
import { BikeService } from './bike.service';
import { BikeController } from './bike.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule], // HttpModule을 가져옴
  controllers: [BikeController], // BikeController 등록
  providers: [BikeService], // BikeService 등록
})
export class BikeModule {}
