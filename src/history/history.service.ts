import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryRecord } from './entities/history.entity';
import { Asset } from '../assets/entities/asset.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryRecord)
    private historyRepository: Repository<HistoryRecord>,
  ) {}

  async recordEvent(params: {
    asset: Asset;
    issue?: Issue;
    actor: string;
    action: string;
  }): Promise<HistoryRecord> {
    const record = this.historyRepository.create(params);
    return this.historyRepository.save(record);
  }

  async getAssetHistory(assetId: string): Promise<HistoryRecord[]> {
    return this.historyRepository.find({
      where: { asset: { id: assetId } },
      order: { createdAt: 'DESC' },
      relations: ['issue'],
    });
  }
}
