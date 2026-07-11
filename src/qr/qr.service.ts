import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('app.cloudinary.cloudName'),
      api_key: this.configService.get<string>('app.cloudinary.apiKey'),
      api_secret: this.configService.get<string>('app.cloudinary.apiSecret'),
    });
  }

  async generateQrCode(url: string): Promise<string> {
    try {
      // Generate QR code as data URI
      const qrCodeDataUri = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Since we might not have Cloudinary configured for the hackathon,
      // return the Data URI directly as a fallback if keys are missing
      if (!this.configService.get<string>('app.cloudinary.cloudName')) {
        return qrCodeDataUri;
      }

      try {
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(qrCodeDataUri, {
          folder: 'maintainiq/qrcodes',
        });
        return uploadResponse.secure_url;
      } catch(e) {
        console.warn('Cloudinary upload failed, falling back to data URI', e.message);
        return qrCodeDataUri;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}
