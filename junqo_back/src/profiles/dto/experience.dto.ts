import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ExperienceDTO {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsUUID()
  studentProfileId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsString()
  description: string;

  @IsArray()
  skills: string[];

  // Obligatory for use with casl ability
  constructor(data: Partial<ExperienceDTO>) {
    Object.assign(this, data);
  }
}
