import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { MAX_CONVERSATION_TITLE_LENGTH } from '../../shared/user-validation-constants';

export class UserConversationTitleDTO {
  @ApiProperty({
    description: 'User ID who set this conversation title',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    description: 'Conversation ID this title belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @Expose()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsUUID('4', { message: 'Conversation ID must be a valid UUID' })
  conversationId: string;

  @ApiProperty({
    description: 'Custom title for the conversation set by the user',
    example: 'Project Discussion with Marketing Team',
  })
  @Expose()
  @MaxLength(MAX_CONVERSATION_TITLE_LENGTH, {
    message: `The title length must be shorter than ${MAX_CONVERSATION_TITLE_LENGTH}`,
  })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  constructor(data: Partial<UserConversationTitleDTO>) {
    Object.assign(this, data);
  }
}

// Request to set a conversation title for a user
export class SetConversationTitleDTO {
  @ApiProperty({
    description: 'Custom title for the conversation',
    example: 'Project Discussion with Marketing Team',
  })
  @Expose()
  @MaxLength(MAX_CONVERSATION_TITLE_LENGTH, {
    message: `The title length must be shorter than ${MAX_CONVERSATION_TITLE_LENGTH}`,
  })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
}
