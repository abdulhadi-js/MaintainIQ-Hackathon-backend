import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryRecord } from './entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryRecord])],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
