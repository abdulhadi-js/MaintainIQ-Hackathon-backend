import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('QR')
@Controller('qr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate-bulk')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Generate bulk QR code label sheet data' })
  async generateBulkQr(@Body() data: { urls: string[] }) {
    // Return data URIs or Cloudinary URLs for bulk printing
    const results = await Promise.all(
      data.urls.map(url => this.qrService.generateQrCode(url))
    );
    return { qrcodes: results };
  }
}
