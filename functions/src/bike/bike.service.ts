import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';

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
export class BikeService {
  private firestore: FirebaseFirestore.Firestore;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    const keyFilePath = path.resolve(
      __dirname,
      '../../biketracer-b416d-firebase-adminsdk-sgy25-7f5a755154.json',
    );

    // Firebase Admin SDK 초기화
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(keyFilePath),
      });
    }

    this.firestore = admin.firestore();
    console.log('Firestore initialized with Firebase Admin SDK');
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

      const bikeCollection = this.firestore.collection('bikeStations');

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
    } catch (error) {
      console.error('Failed to update bike data:', error);
    }
  }
}
