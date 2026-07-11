import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignIssueDto {
  @ApiProperty({ example: 'uuid-of-technician' })
  @IsString()
  @IsNotEmpty()
  technicianId: string;
}
