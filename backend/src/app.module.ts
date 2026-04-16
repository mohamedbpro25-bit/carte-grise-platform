import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DossiersModule } from './modules/dossiers/dossiers.module';
import { VehiculesModule } from './modules/vehicules/vehicules.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { PaiementModule } from './modules/paiement/paiement.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AppController } from './app.controller';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				type: (config.get<string>('DB_TYPE') || 'mysql') as any,
				host: config.get<string>('DB_HOST') || 'localhost',
				port: Number(config.get<string>('DB_PORT') || 3306),
				username: config.get<string>('DB_USERNAME') || 'root',
				password: config.get<string>('DB_PASSWORD') || '',
				database: config.get<string>('DB_DATABASE') || 'cartegrise',
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
				retryAttempts: 10,
				retryDelay: 3000,
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		UsersModule,
		DossiersModule,
		VehiculesModule,
		DocumentsModule,
		PaiementModule,
		AdminModule,
		AuditModule,
	],
	controllers: [AppController],
})
export class AppModule {}