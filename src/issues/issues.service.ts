import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from './entities/issue.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { AssignIssueDto } from './dto/assign-issue.dto';
import { AssetsService } from '../assets/assets.service';
import { HistoryService } from '../history/history.service';
import { AssetStatus } from '../assets/entities/asset.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    private readonly assetsService: AssetsService,
    private readonly historyService: HistoryService,
    private readonly usersService: UsersService,
  ) {}

  async create(createIssueDto: CreateIssueDto): Promise<Issue> {
    let asset;
    if (createIssueDto.assetId) {
      asset = await this.assetsService.findOne(createIssueDto.assetId);
    } else if (createIssueDto.assetCode) {
      asset = await this.assetsService.findByCode(createIssueDto.assetCode);
    }

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    
    // Generate simple issue number like ISS-1234
    const issueNumber = `ISS-${Math.floor(1000 + Math.random() * 9000)}`;

    const issue = this.issueRepository.create({
      ...createIssueDto,
      issueNumber,
      status: IssueStatus.REPORTED,
      asset,
    });

    const savedIssue = await this.issueRepository.save(issue);

    // Update asset status
    await this.assetsService.updateStatus(asset.id, AssetStatus.ISSUE_REPORTED);

    // Record history
    await this.historyService.recordEvent({
      asset,
      issue: savedIssue,
      actor: createIssueDto.reporterName || 'Public User',
      action: `Issue reported: ${savedIssue.title}`,
    });

    return savedIssue;
  }

  async findAll(): Promise<Issue[]> {
    return this.issueRepository.find({
      relations: ['asset', 'assignedTechnician'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Issue> {
    const issue = await this.issueRepository.findOne({
      where: { id },
      relations: ['asset', 'assignedTechnician', 'history', 'maintenanceRecords'],
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    return issue;
  }

  async assign(id: string, assignIssueDto: AssignIssueDto, userId: string): Promise<Issue> {
    const issue = await this.findOne(id);
    const technician = await this.usersService.findById(assignIssueDto.technicianId);

    issue.assignedTechnician = technician;
    issue.status = IssueStatus.ASSIGNED;
    
    const updatedIssue = await this.issueRepository.save(issue);

    // Record history
    await this.historyService.recordEvent({
      asset: issue.asset,
      issue: updatedIssue,
      actor: 'Admin', // Resolve from userId in real app
      action: `Issue assigned to ${technician.name}`,
    });

    return updatedIssue;
  }

  async updateStatus(id: string, status: IssueStatus, userId: string): Promise<Issue> {
    const issue = await this.findOne(id);
    
    // Validate transitions (simplified)
    if (status === IssueStatus.INSPECTION_STARTED) {
      await this.assetsService.updateStatus(issue.asset.id, AssetStatus.UNDER_INSPECTION);
    } else if (status === IssueStatus.MAINTENANCE_IN_PROGRESS) {
      await this.assetsService.updateStatus(issue.asset.id, AssetStatus.UNDER_MAINTENANCE);
    } else if (status === IssueStatus.RESOLVED) {
      // Rule: cannot resolve without a maintenance record (simplified here to just asset status update)
      await this.assetsService.updateStatus(issue.asset.id, AssetStatus.OPERATIONAL);
    }

    issue.status = status;
    const updatedIssue = await this.issueRepository.save(issue);

    await this.historyService.recordEvent({
      asset: issue.asset,
      issue: updatedIssue,
      actor: 'Technician', // Should be real user
      action: `Issue status changed to ${status}`,
    });

    return updatedIssue;
  }
}
