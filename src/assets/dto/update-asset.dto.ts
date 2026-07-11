import { PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AssetStatus } from '../entities/asset.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiPropertyOptional({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;
}
