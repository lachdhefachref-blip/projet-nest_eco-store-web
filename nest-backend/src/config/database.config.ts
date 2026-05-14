import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const databaseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI') || 'mongodb://127.0.0.1:27017/nest-ecommerce',
  }),
  inject: [ConfigService],
});