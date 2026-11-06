import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GenresModule } from './genres/genres.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [PrismaModule, GenresModule, MoviesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
