import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetCondition } from '../entities/asset.entity';

export class CreateAssetDto {
  @ApiProperty({ example: 'Classroom Projector 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PROJ-101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Room 101, First Floor' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ enum: AssetCondition, default: AssetCondition.GOOD })
  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  lastServiceDate?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  nextServiceDate?: string;

  @ApiPropertyOptional({ example: 'Handle with care.' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
