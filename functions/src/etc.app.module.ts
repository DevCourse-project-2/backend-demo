// etc.app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KakaoModule } from './kakao/kakao.module';
import { UserModule } from './users/user.module'; // UserModule 추가

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        /* configuration logic */
      ], // 필요한 설정 로직
    }),
    KakaoModule,
    UserModule, // UserModule 추가
  ],
})
export class EtcAppModule {}
