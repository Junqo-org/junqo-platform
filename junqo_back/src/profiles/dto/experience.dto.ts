import { Expose } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ExperienceDTO {
  @Expose()
  @IsNotEmpty({ message: 'Experience ID is required' })
  @IsUUID('4', { message: 'Experience ID must be a valid UUID' })
  id: string;

  @Expose()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Expose()
  @IsString({ message: 'Company must be a string' })
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @Expose()
  @IsDate({ message: 'Start date must be a valid date' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: Date;

  @Expose()
  @IsDate({ message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: Date;

  @Expose()
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @Expose()
  @IsArray({ message: 'Skills must be an array' })
  @IsOptional()
  skills?: string[];

  // Obligatory for use with casl ability
  constructor(data: Partial<ExperienceDTO>) {
    Object.assign(this, data);
  }
}

export class ExperienceInputDTO {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Company must be a string' })
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @IsDate({ message: 'Start date must be a valid date' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: Date;

  @IsDate({ message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: Date;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Skills must be an array' })
  @IsOptional()
  skills?: string[];

  constructor(data: Partial<ExperienceInputDTO>) {
    Object.assign(this, data);
  }
}
