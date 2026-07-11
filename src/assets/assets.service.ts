import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetStatus } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QrService } from '../qr/qr.service';
import { HistoryService } from '../history/history.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly qrService: QrService,
    private readonly historyService: HistoryService,
  ) {}

  async create(createAssetDto: CreateAssetDto, userId: string): Promise<Asset> {
    const existingAsset = await this.assetRepository.findOne({
      where: { code: createAssetDto.code },
    });

    if (existingAsset) {
      throw new BadRequestException(`Asset with code ${createAssetDto.code} already exists`);
    }

    const asset = this.assetRepository.create({
      ...createAssetDto,
      status: AssetStatus.OPERATIONAL,
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Generate QR code and public URL
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/asset/${savedAsset.code}`;
    const qrCodeUrl = await this.qrService.generateQrCode(publicUrl);

    savedAsset.qrCodeUrl = qrCodeUrl;
    await this.assetRepository.save(savedAsset);

    // Record history
    await this.historyService.recordEvent({
      asset: savedAsset,
      actor: 'Admin', // In real app, use userId to get user name
      action: 'Asset registered',
    });

    return savedAsset;
  }

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.find({
      relations: ['assignedTechnician'],
    });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ['assignedTechnician', 'issues', 'maintenanceRecords', 'history'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async findByCode(code: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { code },
      relations: ['assignedTechnician', 'issues', 'history'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with code ${code} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string): Promise<Asset> {
    const asset = await this.findOne(id);
    
    // Prevent duplicate codes if code is changed
    if (updateAssetDto.code && updateAssetDto.code !== asset.code) {
      const existingAsset = await this.assetRepository.findOne({
        where: { code: updateAssetDto.code },
      });
      if (existingAsset) {
        throw new BadRequestException(`Asset with code ${updateAssetDto.code} already exists`);
      }
    }

    Object.assign(asset, updateAssetDto);
    const updatedAsset = await this.assetRepository.save(asset);

    // Record history for significant changes
    if (updateAssetDto.status) {
      await this.historyService.recordEvent({
        asset: updatedAsset,
        actor: 'Admin', // In real app, resolve user name
        action: `Status changed to ${updateAssetDto.status}`,
      });
    }

    return updatedAsset;
  }

  async updateStatus(id: string, status: AssetStatus): Promise<Asset> {
    const asset = await this.findOne(id);
    asset.status = status;
    return this.assetRepository.save(asset);
  }

  async retire(id: string, userId: string): Promise<Asset> {
    return this.update(id, { status: AssetStatus.RETIRED }, userId);
  }
}
