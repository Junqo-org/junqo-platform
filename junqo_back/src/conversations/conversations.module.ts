import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsRepositoryModule } from './repository/conversations.repository.module';
import { MessagesModule } from '../messages/messages.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [ConversationsRepositoryModule, MessagesModule, CaslModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
