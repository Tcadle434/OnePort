import { Module } from "@nestjs/common";
import { BalancesController } from "./balances.controller";
import { BalancesService } from "./balances.service";
import { WalletsModule } from "../wallets/wallets.module";
import { RedisCacheModule } from "../config/cache.module";

@Module({
	imports: [WalletsModule, RedisCacheModule],
	controllers: [BalancesController],
	providers: [BalancesService],
	exports: [BalancesService],
})
export class BalancesModule {}
