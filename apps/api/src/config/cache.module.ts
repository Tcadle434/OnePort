import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-ioredis";

@Module({
	imports: [
		CacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return {
					store: redisStore,
					host: configService.get<string>("REDIS_HOST", "localhost"),
					port: configService.get<number>("REDIS_PORT", 6379),
					ttl: 600, // 10 minutes default TTL
				};
			},
			isGlobal: true,
		}),
	],
	exports: [CacheModule],
})
export class RedisCacheModule {}
