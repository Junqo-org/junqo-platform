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
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { OfferStatus } from './offer-status.enum';
import { WorkContext } from './work-context.enum';
import { OfferType } from './offer-type.enum';

// Offer retrieved from database
export class OfferDTO {
  @Expose()
  @IsNotEmpty({ message: 'Offer ID is required' })
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  id: string;

  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @Expose()
  @IsNotEmpty({ message: 'Created at date is required' })
  @IsDate({ message: 'Created at must be a valid date' })
  createdAt: Date;

  @Expose()
  @IsNotEmpty({ message: 'Updated at date is required' })
  @IsDate({ message: 'Updated at must be a valid date' })
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate({ message: 'Deleted at must be a valid date' })
  deletedAt?: Date;

  @Expose()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @Expose()
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OfferStatus, {
    message: 'Status must be a valid OfferStatus enum value',
  })
  status: OfferStatus;

  @Expose()
  @IsNotEmpty({ message: 'View count is required' })
  @IsInt({ message: 'View count must be an integer' })
  viewCount: number;

  @Expose()
  @IsNotEmpty({ message: 'Offer type is required' })
  @IsEnum(OfferType, {
    message: 'Offer type must be a valid OfferType enum value',
  })
  offerType: OfferType;

  // Duration in months
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  duration?: string;

  // Salary per month
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Salary must be an integer' })
  salary?: string;

  @Expose()
  @IsNotEmpty({ message: 'Work location type is required' })
  @IsEnum(WorkContext, {
    message: 'Work location type must be a valid WorkContext enum value',
  })
  workLocationType: WorkContext;

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Benefits must be an array' })
  @IsString({ each: true, message: 'Each benefit must be a string' })
  benefits?: string[];

  // Number of years distant to bac (0 corresponds to BAC level)
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
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @Expose()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @Expose()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  @Expose()
  @IsOptional()
  @IsEnum(OfferStatus, {
    message: 'Status must be a valid OfferStatus enum value',
  })
  status: OfferStatus;

  @Expose()
  @IsNotEmpty({ message: 'Offer type is required' })
  @IsEnum(OfferType, {
    message: 'Offer type must be a valid OfferType enum value',
  })
  offerType: OfferType;

  // Duration in months
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  duration?: string;

  // Salary per month
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Salary must be an integer' })
  salary?: string;

  @Expose()
  @IsNotEmpty({ message: 'Work location type is required' })
  @IsEnum(WorkContext, {
    message: 'Work location type must be a valid WorkContext enum value',
  })
  workLocationType: WorkContext;

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Benefits must be an array' })
  @IsString({ each: true, message: 'Each benefit must be a string' })
  benefits?: string[];

  // Number of years distant to bac (0 corresponds to BAC level)
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Education level must be an integer' })
  educationLevel?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<CreateOfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to update an Offer
export class UpdateOfferDTO extends PartialType(
  OmitType(CreateOfferDTO, ['userId'] as const),
) {}
