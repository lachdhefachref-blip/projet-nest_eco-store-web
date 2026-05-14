import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.get<string>('clientUrl'),
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') || 5001;
  await app.listen(port);

  // MongoDB connection status
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? '✅ MongoDB connected' : '⚠️  MongoDB not ready';
  const dbUri = configService.get<string>('database.uri') || '';
  const maskedUri = dbUri.replace(/:\/\/[^@]+@/, '://<credentials>@');

  console.log(`\n🚀 Server is running on: http://localhost:${port}/api`);
  console.log(`${dbStatus}  (${maskedUri})`);
  console.log(`🌍 Accepting requests from: ${configService.get<string>('clientUrl')}`);
  console.log(`📦 Environment: ${configService.get<string>('nodeEnv')}\n`);
}
bootstrap();
