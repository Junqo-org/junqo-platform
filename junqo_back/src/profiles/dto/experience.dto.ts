import { IsArray, IsDate, IsNotEmpty, IsString } from 'class-validator';

export class ExperienceDTO {
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

  constructor(
    title: string,
    company: string,
    startDate: Date,
    endDate: Date,
    description: string,
    skills: string[],
  ) {
    this.title = title;
    this.company = company;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
    this.skills = skills;
  }
}
