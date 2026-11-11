import { IsEnum } from 'class-validator';
import { WatchStatus } from '@prisma/client';

export class UpdateMovieStatusDto {
  @IsEnum(WatchStatus)
  status!: WatchStatus;
}
