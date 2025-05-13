import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

// Message retrieved from database
export class MessageDTO {
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsUUID('4', { message: 'Message ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: 'Unique identifier for the owner user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Owner ID is required' })
  @IsUUID('4', { message: 'Owner ID must be a valid UUID' })
  senderId: string;

  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;

  @ApiProperty({
    description: "Message's content",
    example: 'hello',
  })
  @Expose()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<MessageDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Message
export class CreateMessageDTO {
  @ApiProperty({
    description: 'Unique identifier for the owner user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Owner ID is required' })
  @IsUUID('4', { message: 'Owner ID must be a valid UUID' })
  senderId: string;

  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;

  @ApiProperty({
    description: "Message's content",
    example: 'hello',
  })
  @Expose()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;
}

// Expected values to update a Message
export class UpdateMessageDTO {
  @ApiProperty({
    description: "Message's content",
    example: 'hello',
  })
  @Expose()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;
}
