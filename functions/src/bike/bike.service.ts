import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as mysql from 'mysql2/promise';

interface BikeStation {
  stationId: string;
  stationName: string;
  rackTotCnt: number;
  parkingBikeTotCnt: number;
  shared: number;
  stationLatitude: string;
  stationLongitude: string;
}

@Injectable()
export class BikeService implements OnModuleInit {
  private connection!: mysql.Connection;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // MySQL 연결 초기화
    this.connection = await mysql.createConnection({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD') || '',
      database: this.configService.get<string>('DB_NAME'),
    });

    console.log('Connected to MySQL');
  }

  async updateBikeData(): Promise<void> {
    const apiKey = this.configService.get<string>('PUBLIC_API_KEY');
    const apiUrls = [
      `http://openapi.seoul.go.kr:8088/${apiKey}/json/bikeList/1/1000/`,
      `http://openapi.seoul.go.kr:8088/${apiKey}/json/bikeList/1001/2000/`,
      `http://openapi.seoul.go.kr:8088/${apiKey}/json/bikeList/2001/3000/`,
    ];

    try {
      const responses = await Promise.all(
        apiUrls.map((url) => firstValueFrom(this.httpService.get(url))),
      );
      const bikeData: BikeStation[] = responses.flatMap((response) =>
        response.data.rentBikeStatus.row.map((station: any) => ({
          stationId: station.stationId,
          stationName: station.stationName,
          rackTotCnt: Number(station.rackTotCnt),
          parkingBikeTotCnt: Number(station.parkingBikeTotCnt),
          shared: Number(station.shared),
          stationLatitude: station.stationLatitude,
          stationLongitude: station.stationLongitude,
        })),
      );

      // MySQL 테이블 비우기
      await this.connection.execute('DELETE FROM stations');

      // 데이터 삽입
      const insertQuery = `
        INSERT INTO stations (station_id, station_name, rack_tot_cnt, parking_bike_tot_cnt, shared, station_latitude, station_longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const station of bikeData) {
        await this.connection.execute(insertQuery, [
          station.stationId,
          station.stationName,
          station.rackTotCnt,
          station.parkingBikeTotCnt,
          station.shared,
          station.stationLatitude,
          station.stationLongitude,
        ]);
      }

      console.log('Bike data updated in MySQL');
    } catch (error: any) {
      console.error('Failed to update bike data:', error);
    }
  }
}
