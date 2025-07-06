import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  IsIn,
  ValidateNested,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { OfferType } from './offer-type.enum';
import { OfferStatus } from './offer-status.enum';
import { WorkContext } from './work-context.enum';
import { OfferDTO } from './offer.dto';

export class OfferQueryDTO {
  @ApiPropertyOptional({
    description: 'User ID of the offer creator',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Title of the job offer',
    example: 'Senior Frontend Developer',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Filter by skills (comma-separated string or array)',
    example: ['JavaScript', 'React', 'Node.js'],
  })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true })
  @Type(() => String)
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Current status of the offer',
    enum: OfferStatus,
    example: 'ACTIVE',
  })
  @Expose()
  @IsOptional()
  @IsEnum(OfferStatus, {
    message: 'Status must be a valid OfferStatus enum value',
  })
  status?: OfferStatus;

  @ApiPropertyOptional({
    description: 'Type of offer (internship, full-time, etc.)',
    enum: OfferType,
    example: 'INTERNSHIP',
  })
  @Expose()
  @IsOptional()
  @IsEnum(OfferType, {
    message: 'Offer type must be a valid OfferType enum value',
  })
  offerType?: OfferType;

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

  @ApiPropertyOptional({
    description: 'Work location type (on-site, remote, hybrid)',
    enum: WorkContext,
    example: 'HYBRID',
  })
  @Expose()
  @IsOptional()
  @IsEnum(WorkContext, {
    message: 'Work location type must be a valid WorkContext enum value',
  })
  workLocationType?: WorkContext;

  @ApiPropertyOptional({
    description: 'Benefits offered with the position',
    example: ['Health Insurance', 'Remote Work', '30 Days PTO'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
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

  @ApiPropertyOptional({
    description: 'Filter by seen status',
    enum: ['any', 'true', 'false'],
    default: 'any',
    example: 'any',
  })
  @Expose()
  @IsOptional()
  @IsIn(['any', 'true', 'false'], {
    message: 'Seen filter must be one of: any, true, false',
  })
  seen?: 'any' | 'true' | 'false';

  @ApiPropertyOptional({
    description: 'Mode to fetch skills "all" or  "any"',
    default: 'any',
    example: 'all',
  })
  @Expose()
  @IsOptional()
  @IsIn(['all', 'any'])
  mode?: 'all' | 'any';

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

export class OfferQueryOutputDTO {
  @ApiPropertyOptional({
    description: 'Array of student profiles',
    type: [OfferDTO],
  })
  @Expose()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => OfferDTO)
  rows: OfferDTO[];

  @ApiPropertyOptional({
    description: 'Total number of records',
    example: 42,
  })
  @Expose()
  @IsInt()
  @Type(() => Number)
  count: number;
}
