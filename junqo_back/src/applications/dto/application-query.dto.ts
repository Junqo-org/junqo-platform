import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApplicationStatus } from './application-status.enum';
import { ApplicationDTO } from './application.dto';

export class ApplicationQueryDTO {
  @ApiPropertyOptional({
    description: 'Offer ID that the application relates to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  offerId?: string;

  @ApiPropertyOptional({
    description: 'Student ID of the application owner',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Company ID that the application relates to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    example: 'PENDING',
  })
  @Expose()
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: 'Status must be a valid ApplicationStatus enum value',
  })
  status?: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Offset number for pagination',
    example: 1,
    minimum: 0,
  })
  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    example: 10,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;
}

export class ApplicationQueryOutputDTO {
  @ApiPropertyOptional({
    description: 'Array of student profiles',
    type: [ApplicationDTO],
  })
  @Expose()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ApplicationDTO)
  rows: ApplicationDTO[];

  @ApiPropertyOptional({
    description: 'Total number of records',
    example: 42,
  })
  @Expose()
  @IsInt()
  @Type(() => Number)
  count: number;
}
