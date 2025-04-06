import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Company Profile retrieved from database
export class CompanyProfileDTO {
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
    description: 'Company name',
    example: 'Acme Corporation',
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
    description: 'URL to company logo image',
    example: 'https://example.com/company-logo.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<CompanyProfileDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Company Profile
export class CreateCompanyProfileDTO extends CompanyProfileDTO {}

// Expected values to update a Company Profile
export class UpdateCompanyProfileDTO {
  @ApiPropertyOptional({
    description: 'URL to company logo image',
    example: 'https://example.com/company-logo.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
