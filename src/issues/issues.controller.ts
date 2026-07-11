import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { AssignIssueDto } from './dto/assign-issue.dto';
import { IssueStatus } from './entities/issue.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Report a new issue (Public)' })
  create(@Body() createIssueDto: CreateIssueDto) {
    // This is a public endpoint used by scanning QR code
    return this.issuesService.create(createIssueDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all issues (Internal)' })
  findAll() {
    return this.issuesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get issue details' })
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign an issue to a technician' })
  assign(@Param('id') id: string, @Body() assignIssueDto: AssignIssueDto, @Req() req: any) {
    return this.issuesService.assign(id, assignIssueDto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update issue status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: IssueStatus,
    @Req() req: any
  ) {
    return this.issuesService.updateStatus(id, status, req.user.id);
  }
}
