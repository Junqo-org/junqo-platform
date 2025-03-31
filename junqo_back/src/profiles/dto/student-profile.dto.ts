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
import { ExperienceDTO, ExperienceInputDTO } from './experience.dto';
import { Expose, Type } from 'class-transformer';

// Student Profile retrieved from database
export class StudentProfileDTO {
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

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

  @Expose()
  @IsOptional()
  @IsDataURI({ message: 'Avatar must be a valid Data URI' })
  avatar?: string;

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  skills?: string[];

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
export class CreateStudentProfileDTO extends StudentProfileDTO {}

// Expected values to update a Student Profile
export class UpdateStudentProfileDTO {
  @Expose()
  @IsOptional()
  @IsDataURI({ message: 'Avatar must be a valid Data URI' })
  avatar?: string;

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Skills must be an array' })
  skills?: string[];

  @Expose()
  @IsOptional()
  @IsArray({ message: 'Experiences must be an array' })
  @ValidateNested({
    each: true,
    message: 'Each experience must be a valid ExperienceDTO',
  })
  experiences?: ExperienceInputDTO[];
}
