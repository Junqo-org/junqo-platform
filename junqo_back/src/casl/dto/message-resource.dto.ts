import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { ConversationResource } from './conversation-resource.dto';

export class MessageResource {
  @Expose()
  @IsUUID('4', { message: 'Sender ID must be a valid UUID' })
  public senderId?: string;

  @Expose()
  public conversation?: ConversationResource;

  constructor(senderId?: string, conversation?: ConversationResource) {
    this.senderId = senderId;
    this.conversation = conversation;
  }

  // Helper getter for CASL rules
  get conversationParticipantsIds(): string[] {
    return this.conversation?.participantsIds || [];
  }
}
