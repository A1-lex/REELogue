import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { WatchStatus } from '@prisma/client';

export class FindMoviesQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50)
  limit: number = 6;

  @IsOptional() @IsString() @MaxLength(100)
  search?: string;

  @IsOptional() @IsEnum(WatchStatus)
  status?: WatchStatus;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  genreId?: number;
}