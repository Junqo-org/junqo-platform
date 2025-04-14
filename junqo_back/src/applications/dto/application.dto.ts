import {
  IsUUID,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ApplicationStatus } from './application-status.enum';
import { StudentProfileDTO } from '../../student-profiles/dto/student-profile.dto';
import { CompanyProfileDTO } from '../../company-profiles/dto/company-profile.dto';
import { OfferDTO } from '../../offers/dto/offer.dto';

// Application retrieved from database
export class ApplicationDTO {
  @ApiProperty({
    description: 'Unique identifier for the application',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Application ID is required' })
  @IsUUID('4', { message: 'Application ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: 'Student ID of the application creator',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  studentId: string;

  @ApiProperty({
    description: 'Student Profile of the application creator',
  })
  @Expose()
  @IsNotEmpty({ message: 'Student Profile is required' })
  @Type(() => StudentProfileDTO)
  student: StudentProfileDTO;

  @ApiProperty({
    description: 'Company ID owning the offer related by the application',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Company ID is required' })
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @ApiProperty({
    description: 'Company ID owning the offer related by the application',
  })
  @Expose()
  @IsNotEmpty({ message: 'Company Profile is required' })
  @Type(() => CompanyProfileDTO)
  company: CompanyProfileDTO;

  @ApiProperty({
    description: 'Offer ID of the offer being applied to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer ID is required' })
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  offerId: string;

  @ApiProperty({
    description: 'Offer ID of the offer being applied to',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer is required' })
  @Type(() => OfferDTO)
  offer: OfferDTO;

  @ApiProperty({
    description: 'Date when the application was created',
    type: Date,
  })
  @Expose()
  @IsNotEmpty({ message: 'Created at date is required' })
  @IsDate({ message: 'Created at must be a valid date' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the application was last updated',
    type: Date,
  })
  @Expose()
  @IsNotEmpty({ message: 'Updated at date is required' })
  @IsDate({ message: 'Updated at must be a valid date' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Date when the application was deleted (soft delete)',
    type: Date,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsDate({ message: 'Deleted at must be a valid date' })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ApplicationStatus, {
    message: 'Status must be a valid ApplicationStatus enum value',
  })
  status: ApplicationStatus;

  // Obligatory for use with casl ability
  constructor(data: Partial<ApplicationDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create an Application
export class CreateApplicationDTO {
  @ApiProperty({
    description: 'Student ID of the application creator',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  studentId: string;

  @ApiProperty({
    description: 'Company ID owning the offer related by the application',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Company ID is required' })
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @ApiProperty({
    description: 'Offer ID of the offer being applied to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer ID is required' })
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  offerId: string;

  @ApiProperty({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: 'Status must be a valid ApplicationStatus enum value',
  })
  status?: ApplicationStatus;

  // Obligatory for use with casl ability
  constructor(data: Partial<CreateApplicationDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to update an Application
export class UpdateApplicationDTO {
  @ApiProperty({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: 'Status must be a valid ApplicationStatus enum value',
  })
  status?: ApplicationStatus;
}
