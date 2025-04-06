import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// School Profile retrieved from database
export class SchoolProfileDTO {
  @ApiProperty({
    description: 'User ID that owns this profile',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'School name',
    example: 'University of Technology',
    minLength: MIN_NAME_LENGTH,
    maxLength: MAX_NAME_LENGTH,
  })
  @Expose()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Name must be at most ${MAX_NAME_LENGTH} characters long`,
  })
  name: string;

  @ApiPropertyOptional({
    description: "URL to school's logo image",
    example: 'https://example.com/school-logo.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'School description',
    example: 'A leading software development school.',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'school website URL',
    example: 'https://www.acmecorp.com',
  })
  @Expose()
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  websiteUrl?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<SchoolProfileDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a School Profile
export class CreateSchoolProfileDTO extends SchoolProfileDTO {}

// Expected values to update a School Profile
export class UpdateSchoolProfileDTO {
  @ApiPropertyOptional({
    description: "URL to school's logo image",
    example: 'https://example.com/school-logo.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'School description',
    example: 'A leading software development school.',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'school website URL',
    example: 'https://www.acmecorp.com',
  })
  @Expose()
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  websiteUrl?: string;
}

export class SchoolProfileQueryDTO {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly limit?: number;
}
