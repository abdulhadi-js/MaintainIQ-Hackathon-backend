import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('app.cloudinary.cloudName'),
      api_key: this.configService.get<string>('app.cloudinary.apiKey'),
      api_secret: this.configService.get<string>('app.cloudinary.apiSecret'),
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!this.configService.get<string>('app.cloudinary.cloudName')) {
      // Return a mock URL if Cloudinary is not configured (e.g., for track B/C or local testing without keys)
      return `https://dummyimage.com/600x400/000/fff&text=${file.originalname}`;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'maintainiq/evidence' },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Failed to upload file'));
          } else {
            resolve(result?.secure_url || '');
          }
        },
      ).end(file.buffer);
    });
  }
}
