// etc.app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KakaoModule } from './kakao/kakao.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        /* configuration logic */
      ], // 필요한 설정 로직
    }),
    KakaoModule,
  ],
})
export class EtcAppModule {}

//통합 모듈을 configModule로 생성하는 파일임, kakao login을 포함 다양한 기능을 한 번에 묶어서 모듈화
