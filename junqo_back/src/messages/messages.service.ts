import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  MessageQueryDTO,
  MessageQueryOutputDTO,
} from './dto/message-query.dto';
import {
  CreateMessageDTO,
  MessageDTO,
  UpdateMessageDTO,
} from './dto/message.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { MessagesRepository } from './repository/messages.repository';
import { plainToInstance } from 'class-transformer';
import { MessageResource } from '../casl/dto/message-resource.dto';
import { ConversationResource } from '../casl/dto/conversation-resource.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { UpdateConversationDTO } from '../conversations/dto/conversation.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly conversationService: ConversationsService,
  ) {}

  /**
   * Retrieves messages by conversation ID with optional filters.
   *
   * @param currentUser - The authenticated user requesting the messages
   * @param id - The ID of the conversation
   * @param query - The query parameters for filtering messages
   * @returns A list of messages matching the query
   * @throws InternalServerErrorException if retrieval fails
   */
  public async findByConversationId(
    currentUser: AuthUserDTO,
    id: string,
    query: MessageQueryDTO,
  ): Promise<MessageQueryOutputDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const conversation = await this.conversationService.findOneById(
        currentUser,
        id,
      );

      if (
        ability.cannot(
          Actions.READ,
          new ConversationResource(conversation.participantsIds),
        )
      ) {
        throw new ForbiddenException(
          'You do not have permissions to read this conversation',
        );
      }

      const messagesResult = await this.messagesRepository.findByConversationId(
        id,
        query,
      );

      const filteredMessages = messagesResult.filter((message) => {
        const messageResource = plainToInstance(MessageResource, {
          ...message,
          conversation,
        });

        return ability.can(Actions.READ, messageResource);
      });

      const queryResult: MessageQueryOutputDTO = {
        rows: filteredMessages,
        count: filteredMessages.length,
      };

      return queryResult;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to retrieve messages for conversation ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves a message by its ID.
   *
   * @param currentUser - The authenticated user requesting the message
   * @param id - The ID of the message to retrieve
   * @returns The requested message
   * @throws NotFoundException if the message does not exist
   * @throws ForbiddenException if the user lacks permission
   * @throws InternalServerErrorException if retrieval fails
   */
  public async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<MessageDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const message = await this.messagesRepository.findOneById(id);
    if (!message) {
      throw new NotFoundException(`Message ${id} not found`);
    }

    if (ability.cannot(Actions.READ, message)) {
      throw new ForbiddenException(
        'You do not have permission to view this message',
      );
    }
    return message;
  }

  // TODO
  // /**
  //  * Retrieves messages based on a query.
  //  *
  //  * @param currentUser - The authenticated user requesting the messages
  //  * @param query - The query parameters for filtering messages
  //  * @returns A list of messages matching the query
  //  * @throws InternalServerErrorException if retrieval fails
  //  */
  // public async findByQuery(
  //   currentUser: AuthUserDTO,
  //   query: MessageQueryDTO,
  // ): Promise<MessageQueryOutputDTO> {
  //   try {
  //     return await this.messagesRepository.findByQuery(query);
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `Failed to retrieve messages: ${error.message}`,
  //     );
  //   }
  // }

  /**
   * Creates a new message in a conversation.
   *
   * @param currentUser - The authenticated user creating the message
   * @param payload - The data for the new message
   * @returns The created message
   * @throws ForbiddenException if the user lacks permission
   * @throws InternalServerErrorException if creation fails
   */
  public async create(
    currentUser: AuthUserDTO,
    payload: CreateMessageDTO,
  ): Promise<MessageDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const conversation = await this.conversationService.findOneById(
        currentUser,
        payload.conversationId,
      );

      if (conversation == null) {
        throw new BadRequestException(
          `Failed to create message: conversation #${payload.conversationId} doesn't exists`,
        );
      }
      const conversationResource = plainToInstance(
        ConversationResource,
        conversation,
      );
      const messageResource = new MessageResource(
        payload.senderId,
        conversationResource,
      );

      if (ability.cannot(Actions.CREATE, messageResource)) {
        throw new ForbiddenException(
          'You do not have permission to create this message',
        );
      }

      const newMessage = await this.messagesRepository.create(
        currentUser.id,
        payload,
      );

      const conversationUpdate: UpdateConversationDTO = {
        lastMessageId: newMessage.id,
      };

      await this.conversationService.update(
        currentUser,
        conversation.id,
        conversationUpdate,
      );
      return newMessage;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Failed to create message: ${error.message}`,
      );
    }
  }

  /**
   * Updates a message with new data.
   *
   * @param currentUser - The authenticated user updating the message
   * @param messageId - The ID of the message to update
   * @param updateMessageDto - The data to update the message with
   * @returns The updated message
   * @throws ForbiddenException if the user lacks permission
   * @throws NotFoundException if the message does not exist
   * @throws InternalServerErrorException if update fails
   */
  public async update(
    currentUser: AuthUserDTO,
    messageId: string,
    updateMessageDto: UpdateMessageDTO,
  ): Promise<MessageDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const message = await this.messagesRepository.findOneById(messageId);
      if (!message) {
        throw new NotFoundException(`Message ${messageId} not found`);
      }

      if (ability.cannot(Actions.UPDATE, message)) {
        throw new ForbiddenException(
          'You do not have permission to update this message',
        );
      }

      const updatedMessage = await this.messagesRepository.update(
        messageId,
        updateMessageDto,
      );

      return updatedMessage;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update message: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a message by its ID if the current user has permission.
   *
   * @param currentUser - The authenticated user requesting the deletion
   * @param messageId - The ID of the message to delete
   * @throws ForbiddenException if the user lacks permission
   * @throws NotFoundException if the message does not exist
   * @throws InternalServerErrorException if deletion fails
   */
  async delete(currentUser: AuthUserDTO, messageId: string): Promise<void> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    try {
      const message = await this.messagesRepository.findOneById(messageId);

      if (!message) {
        throw new NotFoundException(`Message ${messageId} not found`);
      }

      if (ability.cannot(Actions.DELETE, message)) {
        throw new ForbiddenException(
          'You do not have permission to delete this message',
        );
      }

      const isDeleted = await this.messagesRepository.delete(messageId);

      if (!isDeleted) {
        throw new InternalServerErrorException(
          `Failed to delete message ${messageId}`,
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete message: ${error.message}`,
      );
    }
  }

  /**
   * Marks a message as read by a specific user.
   *
   * @param messageId - The ID of the message to mark as read
   * @param userId - The ID of the user marking the message as read
   * @throws NotFoundException if the message does not exist
   * @throws InternalServerErrorException if marking as read fails
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOneById(messageId);

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    const isUpdated = await this.messagesRepository.markAsRead(
      messageId,
      userId,
    );

    if (!isUpdated) {
      throw new InternalServerErrorException(
        `Failed to mark message ${messageId} as read`,
      );
    }
  }
}
