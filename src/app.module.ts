import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],



      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {

        const dbType = configService.get<string>('DB_TYPE') as 'postgres' | 'sqlite';
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: configService.get<number>('DB_PORT') || 5432,
            username: configService.get<string>('DB_USER') || 'crm_user',
            password: configService.get<string>('DB_PASSWORD') || 'crm_password',
            database: configService.get<string>('DB_NAME') || 'techtopia_crm',
            autoLoadEntities: true,
            synchronize: true, // DEV ONLY
          };
        }
        return {
          type: 'better-sqlite3',
          database: 'local_dev.sqlite',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
