// src/kakao/kakao.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class KakaoService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getKakaoToken(code: string): Promise<string> {
    const url = 'https://kauth.kakao.com/oauth/token';
    const payload = {
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
      redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
      code,
    };

    const response = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    return response.data.access_token;
  }

  async getKakaoUserInfo(token: string): Promise<any> {
    const url = 'https://kapi.kakao.com/v2/user/me';
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return response.data;
  }

  async handleKakaoLogin(code: string): Promise<string> {
    const token = await this.getKakaoToken(code);
    const userInfo = await this.getKakaoUserInfo(token);

    // 사용자 정보를 데이터베이스에 저장 또는 조회
    const user = await this.userService.findOrCreate(userInfo.id, userInfo);

    // JWT 토큰 생성
    const jwtToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '90d' },
    );

    return jwtToken;
  }
}
