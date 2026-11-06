import {Global, Module} from '@nestjs/common';
import {PrismaService} from './prisma.service';

@Global() // Makes PrismaService available everywhere without needing to import PrismaModule in every single feature module

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}