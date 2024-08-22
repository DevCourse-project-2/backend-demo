// src/kakao/kakao.module.ts
import { Module } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { KakaoController } from './kakao.controller';
import { HttpModule } from '@nestjs/axios'; // HTTP 요청을 위해 추가
import { UserModule } from '../users/user.module'; // UserModule을 가져옴
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    UserModule, // UserModule을 추가하여 UserService를 사용할 수 있게 함
    JwtModule.register({}), // JWT를 사용하기 위해 추가
  ],
  controllers: [KakaoController],
  providers: [KakaoService],
})
export class KakaoModule {}
