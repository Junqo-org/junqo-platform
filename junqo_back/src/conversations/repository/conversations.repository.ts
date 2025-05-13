import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ConversationDTO,
  CreateConversationDTO,
  UpdateConversationDTO,
} from '../dto/conversation.dto';
import { SetConversationTitleDTO } from '../dto/user-conversation-title.dto';
import { UserConversationTitleDTO } from '../dto/user-conversation-title.dto';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from '../dto/conversation-query.dto';
import { ConversationModel } from './models/conversation.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../users/repository/models/user.model';
import { UserConversationTitleModel } from './models/user-conversation-title.model';
import { MessageModel } from '../../messages/repository/models/message.model';
import * as Sequelize from 'sequelize';

@Injectable()
export class ConversationsRepository {
  private readonly logger = new Logger(ConversationsRepository.name);

  constructor(
    @InjectModel(ConversationModel)
    private readonly conversationModel: typeof ConversationModel,
    @InjectModel(UserConversationTitleModel)
    private readonly userConversationTitleModel: typeof UserConversationTitleModel,
  ) {}

  /**
   * Gets the include options for conversation queries with user-specific title
   *
   * @param currentUserId - The ID of the current user for title filtering
   * @returns Array of include options for Sequelize queries
   */
  private getIncludeOptions(currentUserId?: string) {
    const includes: Sequelize.Includeable[] = [
      {
        model: UserModel,
        as: 'participants',
        attributes: ['id'],
        through: { attributes: [] },
      },
      {
        model: MessageModel,
        as: 'lastMessage',
        required: false,
      },
    ];

    // Only add userTitles filter if currentUserId is provided
    if (currentUserId) {
      includes.push({
        model: UserConversationTitleModel,
        as: 'userTitles',
        where: { userId: currentUserId },
        required: false,
      });
    }

    return includes;
  }

  /**
   * Creates a new conversation
   *
   * @param currentUserId - ID of the user creating the conversation
   * @param createConversationDto - DTO containing conversation creation data
   * @returns Promise resolving to the created ConversationDTO
   * @throws InternalServerErrorException if conversation creation fails
   */
  async create(
    currentUserId: string,
    createConversationDto: CreateConversationDTO,
  ): Promise<ConversationDTO> {
    try {
      const conversation = await this.conversationModel.create();

      if (
        createConversationDto.participantsIds &&
        createConversationDto.participantsIds.length > 0
      ) {
        await conversation.$set(
          'participants',
          createConversationDto.participantsIds,
        );
      }

      if (createConversationDto.title && currentUserId) {
        await this.userConversationTitleModel.create({
          userId: currentUserId,
          conversationId: conversation.id,
          title: createConversationDto.title,
        });
      }

      const createdConversation = await this.conversationModel.findByPk(
        conversation.id,
        {
          include: this.getIncludeOptions(currentUserId),
        },
      );

      return createdConversation.toConversationDTO(currentUserId);
    } catch (error) {
      if (error instanceof Sequelize.ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      this.logger.error(
        `Error creating conversation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates a conversation by its ID (patch-style, only updates specified fields)
   *
   * @param id - ID of the conversation to update
   * @param updateData - Data to update in the conversation
   * @param currentUserId - ID of the current user for title updates
   * @returns Promise resolving to the updated ConversationDTO
   * @throws NotFoundException if conversation not found
   * @throws InternalServerErrorException if update fails
   */
  async update(
    id: string,
    updateData: UpdateConversationDTO,
    currentUserId?: string,
  ): Promise<ConversationDTO> {
    const transaction = await this.conversationModel.sequelize.transaction();

    try {
      const conversation = await this.conversationModel.findByPk(id, {
        transaction,
      });

      if (!conversation) {
        await transaction.rollback();
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }

      await conversation.save({ transaction });

      if (updateData.participantsIds) {
        await conversation.$set('participants', updateData.participantsIds, {
          transaction,
        });
      }

      if (updateData.lastMessageId) {
        await conversation.$set('lastMessageId', updateData.lastMessageId, {
          transaction,
        });
      }

      const updatedConversation = await this.conversationModel.findByPk(id, {
        include: this.getIncludeOptions(currentUserId),
        transaction,
      });

      await transaction.commit();

      return updatedConversation.toConversationDTO(currentUserId);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof Sequelize.ForeignKeyConstraintError)
        throw new BadRequestException('Referenced ID does not exist');
      this.logger.error(
        `Error updating conversation ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Finds conversations by query parameters
   *
   * @param query - Query parameters to filter conversations
   * @returns Promise resolving to an object containing conversations and total count
   * @throws InternalServerErrorException if query execution fails
   */
  async findByQuery(
    query: ConversationQueryDTO,
    currentUserId: string,
  ): Promise<ConversationQueryOutputDTO> {
    try {
      const includeOptions = this.getIncludeOptions(currentUserId);
      let whereCondition = {};

      const conversationsWithCurrentUser = Sequelize.literal(
        `EXISTS (
          SELECT 1 FROM "ConversationParticipants" AS "cp1"
          WHERE "cp1"."conversationId" = "ConversationModel"."id"
          AND "cp1"."userId" = '${currentUserId}'
        )`,
      );
      whereCondition = { [Sequelize.Op.and]: [conversationsWithCurrentUser] };

      if (query.participantId) {
        const conversationsWithParticipant = Sequelize.literal(
          `EXISTS (
            SELECT 1 FROM "ConversationParticipants" AS "cp2"
            WHERE "cp2"."conversationId" = "ConversationModel"."id"
            AND "cp2"."userId" = '${query.participantId}'
          )`,
        );
        whereCondition[Sequelize.Op.and].push(conversationsWithParticipant);
      }

      const { count, rows } = await this.conversationModel.findAndCountAll({
        where: whereCondition,
        include: includeOptions,
        distinct: true,
        order: [
          [
            Sequelize.fn(
              'COALESCE',
              Sequelize.col('lastMessage.updatedAt'),
              Sequelize.col('ConversationModel.updatedAt'),
            ),
            'DESC',
          ],
        ],
        limit: query.limit,
        offset: query.offset,
        subQuery: false,
      });

      const queryOutput: ConversationQueryOutputDTO = {
        rows: rows.map((conversation) =>
          conversation?.toConversationDTO(currentUserId),
        ),
        count,
      };

      return queryOutput;
    } catch (error) {
      this.logger.error(
        `Error finding conversations by query: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Finds a conversation by its ID
   *
   * @param id - ID of the conversation to find
   * @returns Promise resolving to the found ConversationDTO or null if not found
   * @throws InternalServerErrorException if query execution fails
   */
  async findOneById(id: string): Promise<ConversationDTO | null> {
    try {
      const conversation = await this.conversationModel.findByPk(id, {
        include: this.getIncludeOptions(),
      });

      if (!conversation) {
        return null;
      }

      return conversation.toConversationDTO();
    } catch (error) {
      this.logger.error(
        `Error finding conversation by ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Removes a conversation by its ID
   *
   * @param id - ID of the conversation to remove
   * @returns Promise resolving to void
   * @throws NotFoundException if conversation not found
   * @throws InternalServerErrorException if deletion fails
   */
  async remove(id: string): Promise<void> {
    try {
      const conversation = await this.conversationModel.findByPk(id);

      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }

      await conversation.destroy();
    } catch (error) {
      this.logger.error(
        `Error removing conversation ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Sets or updates a custom title for a conversation for a specific user
   *
   * @param userId - ID of the user setting the title
   * @param conversationId - ID of the conversation
   * @param titleDto - DTO containing the title to set
   * @returns UserConversationTitleDTO with the new title
   */
  async setConversationTitle(
    userId: string,
    conversationId: string,
    titleDto: SetConversationTitleDTO,
  ): Promise<UserConversationTitleDTO> {
    try {
      // Check if conversation exists
      const conversation =
        await this.conversationModel.findByPk(conversationId);

      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      }

      // Check if user is participant in the conversation
      const isParticipant = await conversation.$has('participants', userId);
      if (!isParticipant) {
        throw new NotFoundException(
          `User ${userId} is not a participant in conversation ${conversationId}`,
        );
      }

      // Upsert (update or insert) the title
      const [userTitle] = await this.userConversationTitleModel.upsert({
        userId,
        conversationId,
        title: titleDto.title,
      });

      return new UserConversationTitleDTO({
        userId: userTitle.userId,
        conversationId: userTitle.conversationId,
        title: userTitle.title,
      });
    } catch (error) {
      this.logger.error(
        `Error setting conversation title for user ${userId} in conversation ${conversationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Gets a custom title for a conversation for a specific user
   *
   * @param userId - ID of the user
   * @param conversationId - ID of the conversation
   * @returns UserConversationTitleDTO with the title or null if not set
   */
  async getConversationTitle(
    userId: string,
    conversationId: string,
  ): Promise<UserConversationTitleDTO | null> {
    try {
      const userTitle = await this.userConversationTitleModel.findOne({
        where: {
          userId,
          conversationId,
        },
      });

      if (!userTitle) {
        return null;
      }

      return new UserConversationTitleDTO({
        userId: userTitle.userId,
        conversationId: userTitle.conversationId,
        title: userTitle.title,
      });
    } catch (error) {
      this.logger.error(
        `Error getting conversation title for user ${userId} in conversation ${conversationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Removes a custom title for a conversation for a specific user
   *
   * @param userId - ID of the user
   * @param conversationId - ID of the conversation
   */
  async removeConversationTitle(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    try {
      const deleteCount = await this.userConversationTitleModel.destroy({
        where: {
          userId,
          conversationId,
        },
      });

      if (deleteCount === 0) {
        throw new NotFoundException(
          `Title for user ${userId} in conversation ${conversationId} not found`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error removing conversation title for user ${userId} in conversation ${conversationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
