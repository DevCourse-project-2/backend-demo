// src/kakao/kakao.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { KakaoService } from './kakao.service';
import { Response } from 'express';

@Controller('kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Get('callback')
  async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
    const jwtToken = await this.kakaoService.handleKakaoLogin(code);

    // JWT 토큰을 프론트엔드로 전달하기 위해 쿠키에 저장하거나, 쿼리 파라미터로 전달할 수 있음
    res.cookie('jwt', jwtToken, { httpOnly: true });
    res.redirect('/login/success'); // 로그인 성공 시 프론트엔드로 리다이렉트
  }
}