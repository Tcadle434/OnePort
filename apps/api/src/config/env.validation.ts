import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsIn, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST: string;

  @IsNumber()
  POSTGRES_PORT: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRATION: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    {
      PORT: parseInt(config.PORT as string, 10) || 3001,
      NODE_ENV: config.NODE_ENV || 'development',
      POSTGRES_HOST: config.POSTGRES_HOST,
      POSTGRES_PORT: parseInt(config.POSTGRES_PORT as string, 10) || 5432,
      POSTGRES_USER: config.POSTGRES_USER,
      POSTGRES_PASSWORD: config.POSTGRES_PASSWORD,
      POSTGRES_DB: config.POSTGRES_DB,
      JWT_SECRET: config.JWT_SECRET,
      JWT_EXPIRATION: config.JWT_EXPIRATION || '1d',
    },
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}