import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsDataURI,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '../../shared/user-validation-constants';
import { ExperienceDTO } from './experience.dto';
import { Expose, Type } from 'class-transformer';

// Student Profile retrieved from database
export class StudentProfileDTO {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name: string;

  @Expose()
  @IsOptional()
  @IsDataURI()
  avatar?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Expose()
  @Type(() => ExperienceDTO)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
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
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  @MaxLength(MAX_NAME_LENGTH)
  name?: string;

  @Expose()
  @IsOptional()
  @IsDataURI()
  avatar?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  experiences?: ExperienceDTO[];
}
