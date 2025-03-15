import { Expose } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExperienceDTO {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  studentProfileId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  company: string;

  @Expose()
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Expose()
  @IsDate()
  endDate: Date;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsArray()
  skills: string[];

  // Obligatory for use with casl ability
  constructor(data: Partial<ExperienceDTO>) {
    Object.assign(this, data);
  }
}
