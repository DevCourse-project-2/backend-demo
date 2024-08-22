// bike.app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BikeModule } from './bike/bike.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        /* configuration logic */
      ], // 필요한 설정 로직
    }),
    BikeModule,
  ],
})
export class BikeAppModule {}
