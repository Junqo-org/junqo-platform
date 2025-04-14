import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsArray,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OfferStatus } from './offer-status.enum';
import { WorkContext } from './work-context.enum';
import { OfferType } from './offer-type.enum';

// Offer retrieved from database
export class OfferDTO {
  @ApiProperty({
    description: 'Unique identifier for the offer',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer ID is required' })
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: 'User ID of the offer creator',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Date when the offer was created',
    type: Date,
  })
  @Expose()
  @IsNotEmpty({ message: 'Created at date is required' })
  @IsDate({ message: 'Created at must be a valid date' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the offer was last updated',
    type: Date,
  })
  @Expose()
  @IsNotEmpty({ message: 'Updated at date is required' })
  @IsDate({ message: 'Updated at must be a valid date' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Date when the offer was deleted (soft delete)',
    type: Date,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsDate({ message: 'Deleted at must be a valid date' })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Title of the job offer',
    example: 'Senior Frontend Developer',
  })
  @Expose()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the job offer',
    example:
      'We are looking for a senior frontend developer with React experience...',
  })
  @Expose()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({
    description: 'Current status of the offer',
    enum: OfferStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OfferStatus, {
    message: 'Status must be a valid OfferStatus enum value',
  })
  status: OfferStatus;

  @ApiProperty({
    description: 'Number of views the offer has received',
    example: 42,
    minimum: 0,
  })
  @Expose()
  @IsNotEmpty({ message: 'View count is required' })
  @IsInt({ message: 'View count must be an integer' })
  viewCount: number;

  @ApiProperty({
    description: 'Type of offer (internship, full-time, etc.)',
    enum: OfferType,
    example: 'INTERNSHIP',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer type is required' })
  @IsEnum(OfferType, {
    message: 'Offer type must be a valid OfferType enum value',
  })
  offerType: OfferType;

  @ApiPropertyOptional({
    description: 'Duration in months',
    example: '6',
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Monthly salary in the local currency',
    example: '4500',
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Salary must be an integer' })
  salary?: number;

  @ApiProperty({
    description: 'Work location type (on-site, remote, hybrid)',
    enum: WorkContext,
    example: 'HYBRID',
  })
  @Expose()
  @IsNotEmpty({ message: 'Work location type is required' })
  @IsEnum(WorkContext, {
    message: 'Work location type must be a valid WorkContext enum value',
  })
  workLocationType: WorkContext;

  @ApiPropertyOptional({
    description: 'Required skills for the position',
    example: ['JavaScript', 'React', 'TypeScript'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @Type(() => String)
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Benefits offered with the position',
    example: ['Health Insurance', 'Remote Work', '30 Days PTO'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Benefits must be an array' })
  @IsString({ each: true, message: 'Each benefit must be a string' })
  @Type(() => String)
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Education level required (years after BAC)',
    example: '5',
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Education level must be an integer' })
  educationLevel?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<OfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create an Offer
export class CreateOfferDTO {
  @ApiProperty({
    description: 'User ID of the offer creator',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Title of the job offer',
    example: 'Senior Frontend Developer',
  })
  @Expose()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the job offer',
    example:
      'We are looking for a senior frontend developer with React experience...',
  })
  @Expose()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @ApiProperty({
    description: 'Current status of the offer',
    enum: OfferStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer Status is required' })
  @IsEnum(OfferStatus, {
    message: 'Status must be a valid OfferStatus enum value',
  })
  status: OfferStatus;

  @ApiProperty({
    description: 'Type of offer (internship, full-time, etc.)',
    enum: OfferType,
    example: 'INTERNSHIP',
  })
  @Expose()
  @IsNotEmpty({ message: 'Offer type is required' })
  @IsEnum(OfferType, {
    message: 'Offer type must be a valid OfferType enum value',
  })
  offerType: OfferType;

  @ApiPropertyOptional({
    description: 'Duration in months',
    example: 6,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Monthly salary in the local currency',
    example: 4500,
    minimum: 0,
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Salary must be an integer' })
  salary?: number;

  @ApiProperty({
    description: 'Work location type (on-site, remote, hybrid)',
    enum: WorkContext,
    example: 'HYBRID',
  })
  @Expose()
  @IsNotEmpty({ message: 'Work location type is required' })
  @IsEnum(WorkContext, {
    message: 'Work location type must be a valid WorkContext enum value',
  })
  workLocationType: WorkContext;

  @ApiPropertyOptional({
    description: 'Required skills for the position',
    example: ['JavaScript', 'React', 'TypeScript'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @Type(() => String)
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Benefits offered with the position',
    example: ['Health Insurance', 'Remote Work', '30 Days PTO'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Benefits must be an array' })
  @IsString({ each: true, message: 'Each benefit must be a string' })
  @Type(() => String)
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Education level required (years after BAC)',
    example: 5,
    minimum: 0,
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Education level must be an integer' })
  educationLevel?: number;

  // Obligatory for use with casl ability
  constructor(data: Partial<CreateOfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to update an Offer
export class UpdateOfferDTO extends PartialType(
  OmitType(CreateOfferDTO, ['userId'] as const),
) {}
