// import * as functions from 'firebase-functions';
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import express, { Express } from 'express';

// const server: Express = express();

// const createNestServer = async (expressInstance: Express) => {
//   const app = await NestFactory.create(
//     AppModule,
//     new ExpressAdapter(expressInstance),
//   );
//   app.enableCors();
//   await app.init();
// };

// createNestServer(server)
//   .then(() => console.log('NestJS server created'))
//   .catch((err) => console.error('NestJS server creation error', err));

// export const api = functions.https.onRequest(server);
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  await app.init();
};

createNestServer(server)
  .then(() => console.log('NestJS server created'))
  .catch((err) => console.error('NestJS server creation error', err));

export const api = onRequest({ region: ['asia-northeast3'] }, server);
