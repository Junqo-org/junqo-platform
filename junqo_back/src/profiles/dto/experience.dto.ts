import { Expose } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExperienceDTO {
  @Expose()
  @IsNotEmpty({ message: 'Experience ID is required' })
  @IsUUID('4', { message: 'Experience ID must be a valid UUID' })
  id: string;

  @Expose()
  @IsNotEmpty({ message: 'Student Profile ID is required' })
  @IsUUID('4', { message: 'Student Profile ID must be a valid UUID' })
  studentProfileId: string;

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
  endDate: Date;

  @Expose()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @Expose()
  @IsArray({ message: 'Skills must be an array' })
  skills: string[];

  // Obligatory for use with casl ability
  constructor(data: Partial<ExperienceDTO>) {
    Object.assign(this, data);
  }
}
