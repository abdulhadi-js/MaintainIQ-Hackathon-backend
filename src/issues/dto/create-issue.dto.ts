import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuePriority } from '../entities/issue.entity';

export class CreateIssueDto {
  @ApiPropertyOptional({ example: 'uuid-of-asset' })
  @IsString()
  @IsOptional()
  assetId?: string;

  @ApiPropertyOptional({ example: 'PROJ-101' })
  @IsString()
  @IsOptional()
  assetCode?: string;

  @ApiProperty({ example: 'Water leakage and reduced cooling' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The AC is leaking water, making unusual noise...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: IssuePriority })
  @IsEnum(IssuePriority)
  @IsNotEmpty()
  priority: IssuePriority;

  @ApiProperty({ example: 'Leakage / Performance' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reporterName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reporterContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  evidenceUrls?: string[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  aiSuggestedDetails?: any;
}
