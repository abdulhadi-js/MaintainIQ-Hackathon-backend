import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetStatus } from '../assets/entities/asset.entity';
import { Issue, IssueStatus } from '../issues/entities/issue.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  async getDashboardSummary() {
    const totalAssets = await this.assetRepository.count();
    const assetsOutOfService = await this.assetRepository.count({
      where: { status: AssetStatus.OUT_OF_SERVICE },
    });

    const openIssues = await this.issueRepository.count({
      where: [
        { status: IssueStatus.REPORTED },
        { status: IssueStatus.ASSIGNED },
        { status: IssueStatus.INSPECTION_STARTED },
        { status: IssueStatus.MAINTENANCE_IN_PROGRESS },
        { status: IssueStatus.WAITING_FOR_PARTS },
      ],
    });

    const criticalIssues = await this.issueRepository.count({
      where: { priority: 'Critical' as any, status: IssueStatus.REPORTED }, // simplified for demo
    });

    // Just some basic numbers
    return {
      totalAssets,
      openIssues,
      criticalIssues,
      assetsOutOfService,
      overdueService: 0, // Mock for now
      resolvedThisMonth: 5, // Mock for now
    };
  }
}
