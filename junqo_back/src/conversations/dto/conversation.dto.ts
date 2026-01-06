import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MessageDTO } from '../../messages/dto/message.dto';
import { MAX_CONVERSATION_TITLE_LENGTH } from '../../shared/user-validation-constants';
import { OfferDTO } from '../../offers/dto/offer.dto';
import { ApplicationDTO } from '../../applications/dto/application.dto';

// Conversation retrieved from database
export class ConversationDTO {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  id: string;

  @ApiProperty({
    description: 'List of participant user IDs in the conversation',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @Expose()
  @IsArray({ message: 'Participants must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID must be a valid UUID',
  })
  participantsIds: string[];

  @ApiPropertyOptional({
    description: 'Optional last message in the conversation',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      senderId: '123e4567-e89b-12d3-a456-426614174000',
      conversationId: '123e4567-e89b-12d3-a456-426614174000',
      content: 'Let me know your thoughts on this',
    },
    type: MessageDTO,
  })
  @Expose()
  @Type(() => MessageDTO)
  @IsOptional()
  @ValidateNested({
    message: 'lastMessage must be a valid MessageDTO',
  })
  lastMessage?: MessageDTO;

  @ApiProperty({
    description: 'Creation date of the conversation',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsNotEmpty({ message: 'Creation date is required' })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the conversation',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  @IsNotEmpty({ message: 'Update date is required' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Custom title for the conversation (personalized per user)',
    example: 'Project Discussion with Marketing Team',
    maxLength: MAX_CONVERSATION_TITLE_LENGTH,
  })
  @Expose()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(MAX_CONVERSATION_TITLE_LENGTH, {
    message: `The title length must be shorter than ${MAX_CONVERSATION_TITLE_LENGTH}`,
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'ID of the related offer',
    format: 'uuid',
  })
  @Expose()
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  @IsOptional()
  offerId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related application',
    format: 'uuid',
  })
  @Expose()
  @IsUUID('4', { message: 'Application ID must be a valid UUID' })
  @IsOptional()
  applicationId?: string;

  // Obligatory for use with casl ability
  constructor(data: Partial<ConversationDTO>) {
    Object.assign(this, data);
  }
}

// Expected values to create a Conversation
export class CreateConversationDTO {
  @ApiProperty({
    description: 'List of participant user IDs to include in the conversation',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @Expose()
  @IsArray({ message: 'Participants must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID must be a valid UUID',
  })
  participantsIds: string[];

  @ApiPropertyOptional({
    description: 'Custom title for the conversation',
    example: 'Project Discussion with Marketing Team',
    maxLength: MAX_CONVERSATION_TITLE_LENGTH,
  })
  @Expose()
  @MaxLength(MAX_CONVERSATION_TITLE_LENGTH, {
    message: `The title length must be shorter than ${MAX_CONVERSATION_TITLE_LENGTH}`,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'ID of the related offer',
    format: 'uuid',
  })
  @Expose()
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  @IsOptional()
  offerId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related application',
    format: 'uuid',
  })
  @Expose()
  @IsUUID('4', { message: 'Application ID must be a valid UUID' })
  @ApiPropertyOptional({
    description: 'Map of user IDs to their custom conversation titles',
    example: {
      '123e4567-e89b-12d3-a456-426614174000': 'Company Name',
      '223e4567-e89b-12d3-a456-426614174001': 'Student Name',
    },
  })
  @Expose()
  @IsOptional()
  participantTitles?: Record<string, string>;
}

// Expected values to add participants to a Conversation
export class AddParticipantsDTO {
  @ApiProperty({
    description: 'List of participant user IDs to add to the conversation',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @Expose()
  @IsArray({ message: 'Participants to add must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID to add must be a valid UUID',
  })
  participantsIds: string[];
}

// Expected values to remove participants from a Conversation
export class RemoveParticipantsDTO {
  @ApiProperty({
    description: 'List of participant user IDs to remove from the conversation',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @Expose()
  @IsArray({ message: 'Participants to remove must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID to remove must be a valid UUID',
  })
  participantsIds: string[];
}

// Expected values to update a Conversation
export class UpdateConversationDTO {
  @ApiPropertyOptional({
    description: 'Unique identifier for the last message',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsUUID('4', { message: 'Last message ID must be a valid UUID' })
  @IsOptional()
  lastMessageId?: string;

  @ApiPropertyOptional({
    description: 'List of participant user IDs to include in the conversation',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @Expose()
  @IsArray({ message: 'Participants must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each participant ID must be a valid UUID',
  })
  @IsOptional()
  participantsIds?: string[];
}
