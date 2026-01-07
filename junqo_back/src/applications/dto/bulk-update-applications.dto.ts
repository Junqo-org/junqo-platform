import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApplicationStatus } from './application-status.enum';

export class BulkUpdateApplicationsDTO {
  @ApiProperty({
    description: 'Array of application IDs to update',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @Expose()
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  applicationIds: string[];

  @ApiProperty({
    description: 'New status to apply to all applications',
    enum: ApplicationStatus,
    example: 'ACCEPTED',
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class BulkUpdateResultDTO {
  @ApiProperty({
    description: 'Number of applications successfully updated',
    example: 5,
  })
  @Expose()
  updated: number;

  @ApiProperty({
    description: 'Number of applications that failed to update',
    example: 0,
  })
  @Expose()
  failed: number;

  @ApiProperty({
    description: 'Array of application IDs that were successfully updated',
    type: [String],
  })
  @Expose()
  @IsArray()
  updatedIds: string[];

  @ApiProperty({
    description: 'Array of application IDs that failed to update',
    type: [String],
  })
  @Expose()
  @IsArray()
  failedIds: string[];
}

export class MarkAsOpenedDTO {
  @ApiProperty({
    description: 'Application ID to mark as opened',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  applicationId: string;
}
