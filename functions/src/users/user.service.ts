import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class UserService implements OnModuleInit {
  private connection!: mysql.Connection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.connection = await mysql.createConnection({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD') || '',
      database: this.configService.get<string>('DB_NAME'),
    });

    console.log('Connected to MySQL');
  }

  async findOrCreate(kakaoId: string, userInfo: any): Promise<any> {
    // 사용자가 이미 존재하는지 확인
    const [rows]: [RowDataPacket[], any] = await this.connection.execute(
      'SELECT * FROM users WHERE kakao_id = ?',
      [kakaoId],
    );

    if (rows.length > 0) {
      // 사용자가 이미 존재함
      return rows[0];
    } else {
      // 사용자가 존재하지 않음, 새로 생성
      const insertQuery = `
        INSERT INTO users (kakao_id, email, nickname, profile_image_url)
        VALUES (?, ?, ?, ?)
      `;

      await this.connection.execute(insertQuery, [
        kakaoId,
        userInfo.kakao_account.email || null,
        userInfo.properties.nickname || null,
        userInfo.properties.profile_image || null,
      ]);

      // 삽입된 사용자 정보를 다시 조회하여 반환
      const [newUserRows]: [RowDataPacket[], any] = await this.connection.execute(
        'SELECT * FROM users WHERE kakao_id = ?',
        [kakaoId],
      );

      return newUserRows[0];
    }
  }

  async findUserById(id: number): Promise<any> {
    const [rows]: [RowDataPacket[], any] = await this.connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }
}