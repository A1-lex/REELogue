import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}