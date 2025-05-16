import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MessageModel } from './models/message.model';
import { MessageReadStatusModel } from './models/message-read-status.model';
import {
  MessageDTO,
  CreateMessageDTO,
  UpdateMessageDTO,
} from '../dto/message.dto';
import { MessageReadStatusDTO } from '../dto/message-read-status.dto';
import { ForeignKeyConstraintError, Includeable, Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { MessageQueryDTO } from '../dto/message-query.dto';

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectModel(MessageModel)
    private readonly messageModel: typeof MessageModel,
    @InjectModel(MessageReadStatusModel)
    private readonly messageReadStatusModel: typeof MessageReadStatusModel,
  ) {}

  private includeOptions: Includeable[] = [
    { model: MessageReadStatusModel, as: 'readStatus' },
  ];

  /**
   * Finds a message by its ID
   *
   * @param id - The unique identifier of the message to find
   * @returns Promise resolving to the found MessageDTO
   * @throws NotFoundException if the message with the given ID is not found
   * @throws InternalServerErrorException if there's a problem fetching the message
   */
  async findOneById(id: string): Promise<MessageDTO> {
    try {
      const message = await this.messageModel.findByPk(id, {
        include: this.includeOptions,
      });

      if (!message) {
        throw new NotFoundException(`Message #${id} not found`);
      }

      return message.toMessageDTO();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch message: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves messages from a specific conversation with optional pagination
   *
   * @param conversationId - The ID of the conversation to fetch messages from
   * @param query - Optional parameters for pagination (limit, before timestamp)
   * @returns Promise resolving to an array of MessageDTO objects in chronological order
   * @throws InternalServerErrorException if there's a problem fetching the messages
   */
  async findByConversationId(
    conversationId: string,
    query?: MessageQueryDTO,
  ): Promise<MessageDTO[]> {
    try {
      const queryOptions: any = {
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        include: this.includeOptions,
      };

      if (query?.before) {
        queryOptions.where.createdAt = { [Op.lt]: query.before };
      }

      if (query?.limit) {
        queryOptions.limit = query.limit;
      }

      const messages = await this.messageModel.findAll(queryOptions);

      // Return in chronological order (oldest first)
      return messages.map((msg) => msg.toMessageDTO()).reverse();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch messages: ${error.message}`,
      );
    }
  }

  /**
   * Creates a new message in a conversation
   *
   * @param senderId - The id of the user creating the message
   * @param createMessageDto - The data for creating the new message
   * @returns Promise resolving to the created MessageDTO
   * @throws NotFoundException if the specified conversation doesn't exist
   * @throws InternalServerErrorException if the user is not a participant or if message creation fails
   */
  async create(
    senderId: string,
    createMessageDto: CreateMessageDTO,
  ): Promise<MessageDTO> {
    try {
      const newMessage = await this.messageModel.create({
        conversationId: createMessageDto.conversationId,
        senderId: senderId,
        content: createMessageDto.content,
      });

      return newMessage.toMessageDTO();
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to create message: ${error.message}`,
      );
    }
  }

  /**
   * Updates a message by its ID
   *
   * @param id - The unique identifier of the message to update
   * @param userId - The ID of the user attempting to update the message
   * @param updateData - The data to update the message with
   * @returns Promise resolving to the updated MessageDTO
   * @throws NotFoundException if the message with the given ID is not found
   * @throws InternalServerErrorException if the user is not the sender or if there's a problem updating the message
   */
  async update(id: string, updateData: UpdateMessageDTO): Promise<MessageDTO> {
    try {
      const message = await this.messageModel.findByPk(id, {
        include: this.includeOptions,
      });

      if (!message) {
        throw new NotFoundException(`Message #${id} not found`);
      }

      await message.update(updateData);

      return message.toMessageDTO();
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update message: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a message by its ID
   *
   * @param id - The unique identifier of the message to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws NotFoundException if the message with the given ID is not found
   * @throws InternalServerErrorException if there's a problem deleting the message
   */
  async delete(id: string): Promise<boolean> {
    try {
      const message = await this.messageModel.findByPk(id);

      if (!message) {
        throw new NotFoundException(`Message #${id} not found`);
      }

      await message.destroy();
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to delete message: ${error.message}`,
      );
    }
  }

  /**
   * Marks a message as read for a specific user
   *
   * @param messageId - The ID of the message to mark as read
   * @param userId - The ID of the user who read the message
   * @returns Promise resolving to the MessageReadStatusDTO
   * @throws NotFoundException if the message with the given ID is not found
   * @throws InternalServerErrorException if there's a problem updating the read status
   */
  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<MessageReadStatusDTO> {
    try {
      const message = await this.messageModel.findByPk(messageId);

      if (!message) {
        throw new NotFoundException(`Message #${messageId} not found`);
      }

      let readStatus = await this.messageReadStatusModel.findOne({
        where: {
          messageId,
          userId,
        },
      });

      if (readStatus) {
        // Update the timestamp
        await readStatus.update({ readAt: new Date() });
      } else {
        // Create new read status
        readStatus = await this.messageReadStatusModel.create({
          messageId,
          userId,
          readAt: new Date(),
        });
      }

      return readStatus.toMessageReadStatusDTO();
    } catch (error) {
      if (error instanceof ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to mark message as read: ${error.message}`,
      );
    }
  }

  // /**
  //  * Gets the count of unread messages for a user, optionally filtered by conversation
  //  *
  //  * @param userId - The ID of the user to count unread messages for
  //  * @param conversationId - Optional ID of a specific conversation to count messages from
  //  * @returns Promise resolving to the number of unread messages
  //  * @throws InternalServerErrorException if there's a problem counting unread messages
  //  */
  // async getUnreadCount(
  //   userId: string,
  //   conversationId?: string,
  // ): Promise<number> {
  //   try {
  //     const queryOptions: any = {
  //       where: {
  //         senderId: { [Op.ne]: userId },
  //       },
  //       include: [
  //         {
  //           model: MessageReadStatusModel,
  //           as: 'readStatus',
  //           required: false,
  //           where: {
  //             userId,
  //           },
  //         },
  //       ],
  //       distinct: true,
  //     };

  //     if (conversationId) {
  //       queryOptions.where.conversationId = conversationId;
  //     } else {
  //       // TODO
  //       // Only count messages from conversations where the user is a participant
  //       const userConversations = await this.conversationRepository.findAll({
  //         where: {
  //           [Op.or]: [
  //             { creatorId: userId },
  //             { participantsIds: { [Op.contains]: [userId] } },
  //           ],
  //         },
  //         attributes: ['id'],
  //       });

  //       queryOptions.where.conversationId = {
  //         [Op.in]: userConversations.map((c) => c.id),
  //       };
  //     }

  //     // Count messages where the user's read status is null
  //     const count = await this.messageModel.count({
  //       ...queryOptions,
  //       where: {
  //         ...queryOptions.where,
  //         '$readStatus.id$': null, // No read status for this user
  //       },
  //     });

  //     return count;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `Failed to get unread count: ${error.message}`,
  //     );
  //   }
  // }
}
