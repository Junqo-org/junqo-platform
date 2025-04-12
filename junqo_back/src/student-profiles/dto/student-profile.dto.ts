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
  IsInt,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import {
  CreateExperienceDTO,
  ExperienceDTO,
  UpdateExperienceDTO,
} from '../../experiences/dto/experience.dto';
import { Expose, Transform, Type } from 'class-transformer';
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

  @ApiPropertyOptional({
    description: "List of student's work experiences to create",
    type: [CreateExperienceDTO],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Experiences must be an array' })
  @ValidateNested({
    each: true,
    message: 'Each experience must be a valid CreateExperienceDTO',
  })
  @Type(() => UpdateExperienceDTO)
  experiences?: CreateExperienceDTO[];
}

// Expected values to update a Student Profile
export class UpdateStudentProfileDTO {
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

  @ApiPropertyOptional({
    description: "List of student's work experiences to update",
    type: [UpdateExperienceDTO],
  })
  @Expose()
  @IsOptional()
  @IsArray({ message: 'Experiences must be an array' })
  @ValidateNested({
    each: true,
    message: 'Each experience must be a valid UpdateExperienceDTO',
  })
  @Type(() => UpdateExperienceDTO)
  experiences?: UpdateExperienceDTO[];
}

export class StudentProfileQueryDTO {
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
  readonly skills?: string[];

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
