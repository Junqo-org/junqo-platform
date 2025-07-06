import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { MessageDTO } from './message.dto';

export class MessageQueryDTO {
  @ApiPropertyOptional({
    description: 'Maximum number of messages to retrieve',
    default: 20,
    minimum: 1,
  })
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Timestamp to get messages before (for pagination)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Before must be a valid date' })
  before?: Date;
}

export class MessageQueryOutputDTO {
  @ApiProperty({
    description: 'Array of messages matching the query',
    type: [MessageDTO],
  })
  @Expose()
  @Type(() => MessageDTO)
  rows: MessageDTO[];

  @ApiProperty({
    description: 'Total count of messages matching the query',
    type: Number,
  })
  @Expose()
  count: number;

  constructor(data: { rows: MessageDTO[]; count: number }) {
    this.rows = data.rows;
    this.count = data.count;
  }
}
