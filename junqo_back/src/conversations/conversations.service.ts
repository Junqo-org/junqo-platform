import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateConversationDTO,
  ConversationDTO,
  AddParticipantsDTO,
  RemoveParticipantsDTO,
  UpdateConversationDTO,
} from './dto/conversation.dto';
import { SetConversationTitleDTO } from './dto/user-conversation-title.dto';
import { UserConversationTitleDTO } from './dto/user-conversation-title.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { ConversationsRepository } from './repository/conversations.repository';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from './dto/conversation-query.dto';
import { CaslAbilityFactory, Actions } from '../casl/casl-ability.factory';
import { ConversationResource } from '../casl/dto/conversation-resource.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async findByQuery(
    currentUser: AuthUserDTO,
    query: ConversationQueryDTO,
  ): Promise<ConversationQueryOutputDTO> {
    const queryResult: ConversationQueryOutputDTO =
      await this.conversationsRepository.findByQuery(query, currentUser.id);

    // Repository already filters by currentUserId using SQL EXISTS clause
    // Additional application-level filtering is redundant here and causes
    // false negatives if participant relation hydration is incomplete.
    return queryResult;
  }

  async findOneById(
    currentUser: AuthUserDTO,
    id: string,
  ): Promise<ConversationDTO> {
    const conversation: ConversationDTO =
      await this.conversationsRepository.findOneById(id);

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Check if current user has permission
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.READ, conversationResource)) {
      throw new ForbiddenException(
        'You are not authorized to view this conversation',
      );
    }

    return conversation;
  }

  async create(
    currentUser: AuthUserDTO,
    createConversationDto: CreateConversationDTO,
  ): Promise<ConversationDTO> {
    // Ensure the current user is added as a participant
    const participantsIds = [
      ...new Set([...createConversationDto.participantsIds, currentUser.id]),
    ];

    const conversationData: CreateConversationDTO = {
      participantsIds: participantsIds,
      title: createConversationDto.title,
      offerId: createConversationDto.offerId,
      applicationId: createConversationDto.applicationId,
    };

    // Check permission to create a conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversationData,
    );

    if (ability.cannot(Actions.CREATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to create a conversation',
      );
    }

    return await this.conversationsRepository.create(
      currentUser.id,
      conversationData,
    );
  }

  async update(
    currentUser: AuthUserDTO,
    id: string,
    updateData: UpdateConversationDTO,
  ): Promise<ConversationDTO> {
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    const conversation = await this.findOneById(currentUser, id);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.UPDATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to update this conversation',
      );
    }

    return this.conversationsRepository.update(id, updateData);
  }

  async addParticipants(
    currentUser: AuthUserDTO,
    id: string,
    addParticipantsDto: AddParticipantsDTO,
  ): Promise<ConversationDTO> {
    const conversation = await this.findOneById(currentUser, id);

    // Check permission to update the conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.UPDATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to add participants to this conversation',
      );
    }

    try {
      // Update the participants list
      const updatedParticipantsIds = this.updateParticipantsList(
        conversation.participantsIds,
        addParticipantsDto.participantsIds,
        [], // No participants to remove
      );

      const participantsData: AddParticipantsDTO = {
        participantsIds: updatedParticipantsIds,
      };

      // Update the conversation with new participants
      return await this.conversationsRepository.update(id, participantsData);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Failed to add participants: ${error.message}`,
      );
    }
  }

  async removeParticipants(
    currentUser: AuthUserDTO,
    id: string,
    removeParticipantsDto: RemoveParticipantsDTO,
  ): Promise<ConversationDTO> {
    // Verify conversation exists and user is a participant
    const conversation = await this.findOneById(currentUser, id);

    // Check permission to update the conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.UPDATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to remove participants from this conversation',
      );
    }

    try {
      // Update the participants list
      const updatedParticipantsIds = this.updateParticipantsList(
        conversation.participantsIds,
        [], // No participants to add
        removeParticipantsDto.participantsIds,
      );

      // Ensure at least one participant remains
      if (updatedParticipantsIds.length === 0) {
        throw new ForbiddenException(
          'Cannot remove all participants from a conversation',
        );
      }

      const participantsData: AddParticipantsDTO = {
        participantsIds: updatedParticipantsIds,
      };

      // Update the conversation with new participants
      return await this.conversationsRepository.update(id, participantsData);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove participants: ${error.message}`,
      );
    }
  }

  async delete(currentUser: AuthUserDTO, id: string): Promise<void> {
    // First retrieve the conversation to check if it exists
    const conversation = await this.conversationsRepository.findOneById(id);

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Check permission to delete the conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.DELETE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to delete this conversation',
      );
    }

    return this.conversationsRepository.remove(id);
  }

  async setConversationTitle(
    currentUser: AuthUserDTO,
    conversationId: string,
    titleDto: SetConversationTitleDTO,
  ): Promise<UserConversationTitleDTO> {
    // First check if conversation exists and user is participant
    const conversation = await this.findOneById(currentUser, conversationId);

    // Check permission to update the conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.UPDATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to set title for this conversation',
      );
    }

    // Set the title
    return this.conversationsRepository.setConversationTitle(
      currentUser.id,
      conversationId,
      titleDto,
    );
  }

  async getConversationTitle(
    currentUser: AuthUserDTO,
    conversationId: string,
  ): Promise<UserConversationTitleDTO | null> {
    // First check if user is participant in the conversation
    await this.findOneById(currentUser, conversationId);
    // Permission check is handled in findOneById

    return this.conversationsRepository.getConversationTitle(
      currentUser.id,
      conversationId,
    );
  }

  async removeConversationTitle(
    currentUser: AuthUserDTO,
    conversationId: string,
  ): Promise<void> {
    // First check if user is participant in the conversation
    const conversation = await this.findOneById(currentUser, conversationId);

    // Check permission to update the conversation
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    const conversationResource = plainToInstance(
      ConversationResource,
      conversation,
    );

    if (ability.cannot(Actions.UPDATE, conversationResource)) {
      throw new ForbiddenException(
        'You do not have permission to remove title for this conversation',
      );
    }

    return this.conversationsRepository.removeConversationTitle(
      currentUser.id,
      conversationId,
    );
  }

  /**
   * Internal method to set a conversation title for a specific participant.
   * Useful when setting titles for other users (e.g. system generated).
   */
  async setParticipantTitle(
    conversationId: string,
    targetUserId: string,
    title: string,
  ): Promise<void> {
    await this.conversationsRepository.setConversationTitle(
      targetUserId,
      conversationId,
      { title },
    );
  }

  private updateParticipantsList(
    currentParticipants: string[],
    addParticipants: string[],
    removeParticipants: string[],
  ): string[] {
    // First remove participants
    const afterRemoval = currentParticipants.filter(
      (id) => !removeParticipants.includes(id),
    );

    // Then add new participants and ensure uniqueness
    return [...new Set([...afterRemoval, ...addParticipants])];
  }
}
