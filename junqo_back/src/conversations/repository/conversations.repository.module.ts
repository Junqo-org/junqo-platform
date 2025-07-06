import { Module } from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConversationModel } from './models/conversation.model';
import { UserConversationTitleModel } from './models/user-conversation-title.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ConversationModel, UserConversationTitleModel]),
  ],
  providers: [ConversationsRepository],
  exports: [ConversationsRepository],
})
export class ConversationsRepositoryModule {}
