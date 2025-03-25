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
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OfferStatus)
  status: OfferStatus;

  @Expose()
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Expose()
  @IsNotEmpty()
  @IsInt()
  viewCount: number;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OfferType)
  offerType: OfferType;

  // Duration in months
  @Expose()
  @IsOptional()
  @IsInt()
  duration?: string;

  // Salary per month
  @Expose()
  @IsOptional()
  @IsInt()
  salary?: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(WorkContext)
  workLocationType: WorkContext;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  // Number of year distant to bac (0 correspond to BAC level)
  @Expose()
  @IsOptional()
  @IsInt()
  educationLevel?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<OfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Offer
export class CreateOfferDTO {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Expose()
  @IsOptional()
  @IsEnum(OfferStatus)
  status: OfferStatus;

  @Expose()
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OfferType)
  offerType: OfferType;

  // Duration in months
  @Expose()
  @IsOptional()
  @IsInt()
  duration?: string;

  // Salary per month
  @Expose()
  @IsOptional()
  @IsInt()
  salary?: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(WorkContext)
  workLocationType: WorkContext;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  // Number of year distant to bac (0 correspond to BAC level)
  @Expose()
  @IsOptional()
  @IsInt()
  educationLevel?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<CreateOfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to update a Offer
export class UpdateOfferDTO extends PartialType(
  OmitType(CreateOfferDTO, ['userId'] as const),
) {}
