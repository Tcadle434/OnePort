import { IsOptional, IsString } from 'class-validator';

export class UpdateWalletDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  network?: string;
}