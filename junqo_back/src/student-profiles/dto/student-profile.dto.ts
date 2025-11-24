import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsUrl,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import { ExperienceDTO } from '../../experiences/dto/experience.dto';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Student Profile retrieved from database
export class StudentProfileDTO {
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
    description: "Student's full name",
    example: 'John Doe',
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
    description: "URL to student's avatar image",
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: "Student's bio/description",
    example: 'Passionate software developer with 3 years of experience...',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @ApiPropertyOptional({
    description: "Student's phone number",
    example: '+33612345678',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
  })
  @Expose()
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be valid' })
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: "Student's education level",
    example: 'Bachelor in Computer Science',
  })
  @Expose()
  @IsOptional()
  @IsString({ message: 'Education level must be a string' })
  educationLevel?: string;

  @ApiPropertyOptional({
    description: 'List of student skills',
    example: ['JavaScript', 'React', 'Node.js'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @Type(() => String)
  skills?: string[];

  @ApiPropertyOptional({
    description: "List of student's work experiences",
    type: [ExperienceDTO],
  })
  @Expose()
  @Type(() => ExperienceDTO)
  @IsOptional()
  @IsArray({ message: 'Experiences must be an array' })
  @ValidateNested({
    each: true,
    message: 'Each experience must be a valid ExperienceDTO',
  })
  experiences?: ExperienceDTO[];

  // Obligatory for use with casl ability
  constructor(data: Partial<StudentProfileDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Student Profile
export class CreateStudentProfileDTO {
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
    description: "Student's full name",
    example: 'John Doe',
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
    description: "URL to student's avatar image",
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'List of student skills',
    example: ['JavaScript', 'React', 'Node.js'],
    isArray: true,
    type: [String],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true })
  @Type(() => String)
  skills?: string[];
}

// Expected values to update a Student Profile
export class UpdateStudentProfileDTO {
  @ApiPropertyOptional({
    description: "URL to student's avatar image",
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  avatar?: string;

  @ApiPropertyOptional({
    description: "Student's bio/description",
    example: 'Passionate software developer with 3 years of experience...',
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @ApiPropertyOptional({
    description: "Student's phone number",
    example: '+33612345678',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
  })
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: "Student's education level",
    example: 'Bachelor in Computer Science',
  })
  @IsOptional()
  @IsString({ message: 'Education level must be a string' })
  educationLevel?: string;

  @ApiPropertyOptional({
    description: 'List of student skills',
    example: ['JavaScript', 'React', 'Node.js'],
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true })
  @Type(() => String)
  skills?: string[];
}
