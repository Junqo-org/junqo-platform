import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

// DTO for joining a room/conversation
export class JoinRoomWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation to join',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for leaving a room/conversation
export class LeaveRoomWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation to leave',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for getting message history
export class GetMessageHistoryWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;

  @ApiPropertyOptional({
    description: 'Maximum number of messages to retrieve',
    example: 50,
    default: 50,
  })
  @Expose()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Timestamp to get messages before (for pagination)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsOptional()
  before?: Date;
}

// DTO for starting typing indication
export class StartTypingWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for stopping typing indication
export class StopTypingWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for marking a message as read
export class MarkMessageReadWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the message to mark as read',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsUUID('4', { message: 'Message ID must be a valid UUID' })
  messageId: string;

  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for getting online users
export class GetOnlineUsersWebSocketDTO {
  @ApiPropertyOptional({
    description:
      'Unique identifier for the conversation (optional, if not provided returns all online users)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsOptional()
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId?: string;
}

// DTO for updating a message via WebSocket
export class UpdateMessageWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the message to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsUUID('4', { message: 'Message ID must be a valid UUID' })
  messageId: string;

  @ApiProperty({
    description: 'Updated message content',
    example: 'Updated hello message',
  })
  @Expose()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}

// DTO for deleting a message
export class DeleteMessageWebSocketDTO {
  @ApiProperty({
    description: 'Unique identifier for the message to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsUUID('4', { message: 'Message ID must be a valid UUID' })
  messageId: string;

  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;
}
