import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { IssuesService } from '../issues/issues.service';
import { AssetsService } from '../assets/assets.service';
import { UsersService } from '../users/users.service';
import { HistoryService } from '../history/history.service';
import { IssueStatus } from '../issues/entities/issue.entity';
import { AssetStatus } from '../assets/entities/asset.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord)
    private readonly maintenanceRepository: Repository<MaintenanceRecord>,
    private readonly issuesService: IssuesService,
    private readonly assetsService: AssetsService,
    private readonly usersService: UsersService,
    private readonly historyService: HistoryService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto, technicianId: string): Promise<MaintenanceRecord> {
    const issue = await this.issuesService.findOne(createMaintenanceDto.issueId);
    
    if (issue.assignedTechnician?.id !== technicianId) {
      throw new BadRequestException('Only the assigned technician can add maintenance records for this issue');
    }

    const technician = await this.usersService.findById(technicianId);

    const record = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      issue,
      asset: issue.asset,
      technician,
    });

    const savedRecord = await this.maintenanceRepository.save(record);

    // If resolving the issue
    if (createMaintenanceDto.resolveIssue) {
      await this.issuesService.updateStatus(issue.id, IssueStatus.RESOLVED, technicianId);
      
      if (createMaintenanceDto.nextServiceDate) {
        await this.assetsService.update(issue.asset.id, {
          nextServiceDate: createMaintenanceDto.nextServiceDate,
          lastServiceDate: new Date().toISOString(),
          condition: createMaintenanceDto.finalCondition || issue.asset.condition,
        }, technicianId);
      }
    }

    await this.historyService.recordEvent({
      asset: issue.asset,
      issue: issue,
      actor: technician.name,
      action: 'Maintenance record added',
    });

    return savedRecord;
  }

  async findAllByAsset(assetId: string): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.find({
      where: { asset: { id: assetId } },
      relations: ['technician', 'issue'],
      order: { createdAt: 'DESC' },
    });
  }
}
