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
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Expose()
  @IsNotEmpty()
  @IsInt()
  viewCount: number;

  // Obligatory for use with casl ability
  constructor(data: Partial<OfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Offer
export class CreateOfferDTO {
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
  status?: OfferStatus;

  @Expose()
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<CreateOfferDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to update a Offer
export class UpdateOfferDTO extends PartialType(
  OmitType(CreateOfferDTO, ['userId'] as const),
) {}
