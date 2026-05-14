import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): JwtModuleOptions => {
    const expiresIn = configService.get<string>('jwt.accessExpiresIn') || '15m';
    return {
      secret: configService.get<string>('jwt.accessSecret') || 'default_secret',
      signOptions: {
        expiresIn: expiresIn as unknown as number,
      },
    };
  },
  inject: [ConfigService],
});