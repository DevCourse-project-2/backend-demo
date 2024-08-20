import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// JSON 파일을 타입스크립트 방식으로 임포트
import * as serviceAccount from '../../biketracer-b416d-99fb06b86262.json';

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
  private firestore!: FirebaseFirestore.Firestore;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Firebase Admin SDK 초기화
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }

    this.firestore = admin.firestore();
    console.log('Firestore initialized with Firebase Admin SDK');
  }

  async updateBikeData(): Promise<void> {
    if (!this.firestore) {
      console.log('Waiting for Firebase to initialize...');
      await this.waitForFirebaseInitialization();
    }

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

      const bikeCollection = this.firestore.collection('bikeStations');
      console.log('Firestore collection path:', bikeCollection.path);

      const batch = this.firestore.batch();
      const snapshot = await bikeCollection.get();
      snapshot.forEach((doc) => batch.delete(doc.ref));

      bikeData.forEach((station: BikeStation) => {
        console.log('Storing station:', station);
        const docRef = bikeCollection.doc(station.stationId);
        batch.set(docRef, station);
      });

      await batch.commit();
      console.log('Bike data updated in Firestore');
    } catch (error: any) {
      if (error.code === 5) {
        // Firestore에서 NOT_FOUND 에러코드
        console.error('Firestore document not found:', error);
      } else {
        console.error('Failed to update bike data:', error);
      }
    }
  }

  private waitForFirebaseInitialization(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.firestore) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
}
