import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetCondition } from '../../assets/entities/asset.entity';

class PartUsedDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  cost: number;
}

export class CreateMaintenanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  issueId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workPerformed: string;

  @ApiPropertyOptional({ type: [PartUsedDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartUsedDto)
  @IsOptional()
  partsUsed?: PartUsedDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  timeSpentMinutes?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceUrls?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resolveIssue?: boolean;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsEnum(AssetCondition)
  @IsOptional()
  finalCondition?: AssetCondition;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;
}
