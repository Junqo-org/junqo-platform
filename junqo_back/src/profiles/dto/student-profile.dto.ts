import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsDataURI,
  IsUUID,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import { ExperienceDTO } from './experience.dto';

// Student Profile retrieved from database
export class StudentProfileDTO {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @IsOptional()
  @IsDataURI()
  avatar?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  experiences?: ExperienceDTO[];

  // Obligatory for use with casl ability
  constructor(data: Partial<StudentProfileDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Student Profile
export class CreateStudentProfileDTO extends StudentProfileDTO {}

// Expected values to update a Student Profile
export class UpdateStudentProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name?: string;

  @IsOptional()
  @IsDataURI()
  avatar?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  experiences?: ExperienceDTO[];
}
