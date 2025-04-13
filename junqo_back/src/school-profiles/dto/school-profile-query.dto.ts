import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsArray, IsInt, ValidateNested } from 'class-validator';
import { SchoolProfileDTO } from './school-profile.dto';

export class SchoolProfileQueryDTO {
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

export class SchoolProfileQueryOutputDTO {
  @ApiPropertyOptional({
    description: 'Array of school profiles',
    type: [SchoolProfileDTO],
  })
  @Expose()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => SchoolProfileDTO)
  rows: SchoolProfileDTO[];

  @ApiPropertyOptional({
    description: 'Total number of records',
    example: 42,
  })
  @Expose()
  @IsInt()
  @Type(() => Number)
  count: number;
}
