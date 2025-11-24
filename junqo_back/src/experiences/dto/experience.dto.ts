import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ExperienceDTO {
  @ApiProperty({ description: 'Unique identifier for the experience' })
  @Expose()
  @IsNotEmpty({ message: 'Experience ID is required' })
  @IsUUID('4', { message: 'Experience ID must be a valid UUID' })
  id: string;

  @ApiProperty({ description: 'Job title or position name' })
  @Expose()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Company or organization name' })
  @Expose()
  @IsString({ message: 'Company must be a string' })
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @ApiProperty({
    description: 'Start date of the experience',
    example: '2022-01-01',
  })
  @Expose()
  @IsDateString()
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date of the experience',
    example: '2023-01-01',
  })
  @Expose()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Description of responsibilities and achievements',
  })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of skill learned or practiced during this experience',
  })
  @Expose()
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  skills?: string[];

  @ApiProperty({
    description: 'ID of the student profile this experience belongs to',
  })
  @IsUUID()
  studentProfileId: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<ExperienceDTO>) {
    Object.assign(this, data);
  }
}

export class CreateExperienceDTO {
  @ApiProperty({ description: 'Job title or position name' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Company or organization name' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({
    description: 'Start date of the experience',
    example: '2022-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({
    description: 'End date of the experience',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Description of responsibilities and achievements',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of skill learned or practiced during this experience',
  })
  @IsArray({ message: 'Skills must be an array' })
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  skills?: string[];

  constructor(data: Partial<CreateExperienceDTO>) {
    Object.assign(this, data);
  }
}

export class UpdateExperienceDTO extends PartialType(CreateExperienceDTO) {}
