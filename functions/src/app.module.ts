import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BikeModule } from './bike/bike.module';
//import { AppController } from './app.controller'; // AppController 추가

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BikeModule,
  ],
})
export class AppModule {}
