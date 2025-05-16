import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MessagesRepositoryModule } from './repository/messages.repository.module';
import { MessagesController } from './messages.controller';
import { CaslModule } from '../casl/casl.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [
    MessagesRepositoryModule,
    forwardRef(() => ConversationsModule),
    CaslModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
