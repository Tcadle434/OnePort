import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { BalancesService } from "./balances.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("balances")
@UseGuards(JwtAuthGuard)
export class BalancesController {
	constructor(private readonly balancesService: BalancesService) {}

	@Get("wallet/:id")
	getWalletBalance(@Param("id") id: string, @Request() req: any) {
		return this.balancesService.getWalletBalance(id, req.user.id);
	}

	@Get("aggregate")
	getAggregatedBalance(@Request() req: any) {
		return this.balancesService.getAggregatedBalance(req.user.id);
	}
}
