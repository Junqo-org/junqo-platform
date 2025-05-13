import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  MessageQueryDTO,
  MessageQueryOutputDTO,
} from './dto/message-query.dto';
import { CreateMessageDTO, UpdateMessageDTO } from './dto/message.dto';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { MessagesRepository } from './repository/messages.repository';
import { plainToInstance } from 'class-transformer';
import { MessageResource } from '../casl/dto/message-resource.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}
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
  }

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
      const messagesResult = await this.messagesRepository.findByConversationId(
        id,
        query,
      );

      const filteredMessages = messagesResult.filter((message) =>
        ability.can(Actions.READ, message),
      );

      const queryResult: MessageQueryOutputDTO = {
        rows: filteredMessages,
        count: filteredMessages.length,
      };

      return queryResult;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve messages for conversation ${id}: ${error.message}`,
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

  // TODO
  // /**
  //  * Retrieves all messages in a conversation with optional filters.
  //  *
  //  * @param query - The query parameters for filtering messages
  //  * @returns A list of messages matching the query
  //  * @throws InternalServerErrorException if retrieval fails
  //  */
  // public async findAll(query: {
  //   conversationId: string;
  //   limit: number;
  //   before: Date;
  // }): Promise<MessageQueryOutputDTO> {
  //   try {
  //     return await this.messagesRepository.findAll(query);
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
  ): Promise<any> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const messageResource = plainToInstance(MessageResource, payload);

    if (ability.cannot(Actions.CREATE, messageResource)) {
      throw new ForbiddenException(
        'You do not have permission to create this message',
      );
    }

    try {
      return await this.messagesRepository.create(currentUser.id, payload);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create message: ${error.message}`,
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
  public async findOneById(currentUser: AuthUserDTO, id: string): Promise<any> {
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
  ): Promise<string> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const message = await this.messagesRepository.findOneById(messageId);
    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (ability.cannot(Actions.UPDATE, message)) {
      throw new ForbiddenException(
        'You do not have permission to update this message',
      );
    }

    const isUpdated = await this.messagesRepository.update(
      messageId,
      updateMessageDto,
    );
    if (!isUpdated) {
      throw new InternalServerErrorException(
        `Failed to update message ${messageId}`,
      );
    }

    return `Message ${messageId} updated successfully`;
  }
}
