import { NestFactory } from '@nestjs/core';
import { BikeAppModule } from './bike.app.module';
import { EtcAppModule } from './etc.app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

const bikeServer = express();
const etcServer = express();

const createBikeServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    BikeAppModule, // BikeAppModule 사용
    new ExpressAdapter(expressInstance),
  );
  app.enableCors({
    origin: '*',
  });
  await app.init();
};

const createEtcServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    EtcAppModule, // EtcAppModule 사용
    new ExpressAdapter(expressInstance),
  );
  app.enableCors({
    origin: '*',
  });
  await app.init();
};

createBikeServer(bikeServer)
  .then(() => console.log('Bike NestJS server created'))
  .catch((err) => console.error('Bike NestJS server creation error', err));

createEtcServer(etcServer)
  .then(() => console.log('Etc NestJS server created'))
  .catch((err) => console.error('Etc NestJS server creation error', err));

export const bike_stations_update = onRequest(
  { region: ['asia-northeast3'] },
  bikeServer,
);
export const etc = onRequest({ region: ['asia-northeast3'] }, etcServer);
