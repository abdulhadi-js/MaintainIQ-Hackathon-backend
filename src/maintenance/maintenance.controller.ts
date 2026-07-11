import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TECHNICIAN, Role.ADMIN)
  @ApiOperation({ summary: 'Add a maintenance record to an issue' })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @Req() req: any) {
    return this.maintenanceService.create(createMaintenanceDto, req.user.id);
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get all maintenance records for an asset' })
  findAllByAsset(@Param('assetId') assetId: string) {
    return this.maintenanceService.findAllByAsset(assetId);
  }
}
