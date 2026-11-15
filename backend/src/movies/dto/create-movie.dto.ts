import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { WatchStatus } from '@prisma/client';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WatchStatus)
  status?: WatchStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsUrl()
  trailerUrl?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  genreIds: number[];

  @IsOptional()
  @IsUUID('4')
  clientRequestId?: string;
}