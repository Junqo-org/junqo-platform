import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsArray, IsInt, ValidateNested } from 'class-validator';
import { CompanyProfileDTO } from './company-profile.dto';

export class CompanyProfileQueryDTO {
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

export class CompanyProfileQueryOutputDTO {
  @ApiPropertyOptional({
    description: 'Array of company profiles',
    type: [CompanyProfileDTO],
  })
  @Expose()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => CompanyProfileDTO)
  rows: CompanyProfileDTO[];

  @ApiPropertyOptional({
    description: 'Total number of records',
    example: 42,
  })
  @Expose()
  @IsInt()
  @Type(() => Number)
  count: number;
}
