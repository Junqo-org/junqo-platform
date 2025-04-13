import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { StudentProfileDTO } from './student-profile.dto';

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
    description: 'Mode to fetch skills "all" or  "any"',
    default: 'any',
    example: 'all',
  })
  @Expose()
  @IsOptional()
  @IsIn(['all', 'any'])
  readonly mode?: 'all' | 'any';

  @ApiPropertyOptional({
    description: 'Offset number for pagination',
    example: 1,
    minimum: 0,
  })
  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    example: 10,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly limit?: number = 10;
}

export class StudentProfileQueryOutputDTO {
  @ApiPropertyOptional({
    description: 'Array of student profiles',
    type: [StudentProfileDTO],
  })
  @Expose()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => StudentProfileDTO)
  rows: StudentProfileDTO[];

  @ApiPropertyOptional({
    description: 'Total number of records',
    example: 42,
  })
  @Expose()
  @IsInt()
  @Type(() => Number)
  count: number;
}
