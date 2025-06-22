import { IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ConversationDTO } from './conversation.dto';

export class ConversationQueryDTO {
  @ApiProperty({
    description: 'Filter conversations by participant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'Participant ID must be a valid UUID' })
  participantId?: string;

  @ApiProperty({
    description: 'Number of conversations to return',
    example: 10,
    required: false,
    default: 10,
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Number of conversations to skip',
    example: 0,
    required: false,
    default: 0,
  })
  @Expose()
  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number = 0;
}

export class ConversationQueryOutputDTO {
  @ApiProperty({
    description: 'List of conversations matching the query',
    type: [ConversationDTO],
  })
  @Expose()
  @Type(() => ConversationDTO)
  rows: ConversationDTO[];

  @ApiProperty({
    description: 'Total count of conversations matching the query',
    example: 10,
    type: Number,
  })
  @Expose()
  count: number;
}
