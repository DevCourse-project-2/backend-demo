import { Module } from '@nestjs/common';
import { KakaoController } from './kakao.controller';
import { KakaoService } from './kakao.service';
import { HttpModule } from '@nestjs/axios'; // HTTP 요청을 위해 추가

@Module({
  imports: [HttpModule],
  controllers: [KakaoController],
  providers: [KakaoService],
})
export class KakaoModule {}
