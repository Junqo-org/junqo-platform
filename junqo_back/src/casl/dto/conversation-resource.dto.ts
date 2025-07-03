import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class ConversationResource {
  @Expose()
  @IsUUID('4', { message: 'Participant ID must be a valid UUID', each: true })
  public participantsIds?: string[];

  constructor(participantsIds?: string[]) {
    this.participantsIds = participantsIds;
  }
}
