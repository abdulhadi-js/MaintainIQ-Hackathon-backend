import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new asset (Admin)' })
  create(@Body() createAssetDto: CreateAssetDto, @Req() req: any) {
    return this.assetsService.create(createAssetDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all assets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get asset details by ID' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Get('public/:code')
  @ApiOperation({ summary: 'Get safe public asset details by Code (No Auth Required)' })
  async findPublicByCode(@Param('code') code: string) {
    const asset = await this.assetsService.findByCode(code);
    
    // Return only safe fields
    return {
      name: asset.name,
      code: asset.code,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
      photoUrl: asset.photoUrl,
      // Minimal safe history (e.g. only maintenance completions)
      recentActivity: asset.history
        .filter(h => h.action.toLowerCase().includes('maintenance'))
        .slice(0, 5)
        .map(h => ({
          date: h.createdAt,
          action: h.action
        }))
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an asset' })
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @Req() req: any) {
    return this.assetsService.update(id, updateAssetDto, req.user.id);
  }

  @Delete(':id/retire')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retire an asset (Admin)' })
  retire(@Param('id') id: string, @Req() req: any) {
    return this.assetsService.retire(id, req.user.id);
  }
}
