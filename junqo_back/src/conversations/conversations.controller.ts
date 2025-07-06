import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from '../users/users.decorator';
import {
  CreateConversationDTO,
  ConversationDTO,
  AddParticipantsDTO,
  RemoveParticipantsDTO,
} from './dto/conversation.dto';
import { SetConversationTitleDTO } from './dto/user-conversation-title.dto';
import { UserConversationTitleDTO } from './dto/user-conversation-title.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from './dto/conversation-query.dto';
import { MessageDTO, UpdateMessageDTO } from '../messages/dto/message.dto';
import {
  MessageQueryDTO,
  MessageQueryOutputDTO,
} from '../messages/dto/message-query.dto';
import { MessagesService } from '../messages/messages.service';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({
    type: CreateConversationDTO,
    description: 'Conversation creation data',
  })
  @ApiCreatedResponse({
    description: 'Conversation created successfully',
    type: ConversationDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(
    @CurrentUser() currentUser: AuthUserDTO,
    @Body() createConversationDto: CreateConversationDTO,
  ): Promise<ConversationDTO> {
    return await this.conversationsService.create(
      currentUser,
      createConversationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get conversations by query parameters' })
  @ApiOkResponse({
    description: 'Conversations retrieved successfully',
    type: ConversationQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view conversations',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findByQuery(
    @CurrentUser() currentUser: AuthUserDTO,
    @Query() query: ConversationQueryDTO,
  ): Promise<ConversationQueryOutputDTO> {
    return this.conversationsService.findByQuery(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Conversation retrieved successfully',
    type: ConversationDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ConversationDTO> {
    return this.conversationsService.findOneById(currentUser, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation to delete',
    type: String,
    required: true,
  })
  @ApiOkResponse({ description: 'Conversation deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to delete this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async remove(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.conversationsService.delete(currentUser, id);
  }

  @Post(':id/participants')
  @ApiOperation({
    summary: 'Add participants to a conversation',
  })
  @ApiOkResponse({
    description: 'Participants added successfully',
    type: ConversationDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to add participants to this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addParticipants(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() participantsDto: AddParticipantsDTO,
  ): Promise<ConversationDTO> {
    return this.conversationsService.addParticipants(
      currentUser,
      id,
      participantsDto,
    );
  }

  @Delete(':id/participants')
  @ApiOperation({
    summary: 'Remove participants from a conversation',
  })
  async removeParticipants(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() participantsDto: RemoveParticipantsDTO,
  ): Promise<ConversationDTO> {
    return this.conversationsService.removeParticipants(
      currentUser,
      id,
      participantsDto,
    );
  }

  @Get(':id/title')
  @ApiOperation({
    summary: 'Get the custom title for a conversation for the current user',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Title retrieved successfully',
    type: UserConversationTitleDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to get title for this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getConversationTitle(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserConversationTitleDTO> {
    return this.conversationsService.getConversationTitle(currentUser, id);
  }

  @Put(':id/title')
  @ApiOperation({
    summary: 'Set a custom title for a conversation for the current user',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiBody({
    type: SetConversationTitleDTO,
    description: 'The custom title to set for the conversation',
  })
  @ApiCreatedResponse({
    description: 'Title set successfully',
    type: UserConversationTitleDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to set title for this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async setConversationTitle(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() titleDto: SetConversationTitleDTO,
  ): Promise<UserConversationTitleDTO> {
    return this.conversationsService.setConversationTitle(
      currentUser,
      id,
      titleDto,
    );
  }

  @Delete(':id/title')
  @ApiOperation({
    summary: 'Remove the custom title for a conversation for the current user',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiOkResponse({ description: 'Title removed successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to remove title for this conversation',
  })
  @ApiNotFoundResponse({ description: 'Title not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async removeConversationTitle(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.conversationsService.removeConversationTitle(currentUser, id);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Get messages for a specific conversation',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of messages to retrieve',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'before',
    description: 'Timestamp to get messages before (pagination)',
    type: String,
    required: false,
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    type: MessageQueryOutputDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view messages in this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getConversationMessages(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: MessageQueryDTO,
  ): Promise<MessageQueryOutputDTO> {
    return this.messagesService.findByConversationId(currentUser, id, query);
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'Send a new message in a conversation',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the conversation',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateMessageDTO,
    description: 'Message content to send',
  })
  @ApiCreatedResponse({
    description: 'Message sent successfully',
    type: MessageDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to send messages in this conversation',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async sendMessage(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createMessageDto: UpdateMessageDTO,
  ): Promise<MessageDTO> {
    return this.messagesService.create(currentUser, {
      senderId: currentUser.id,
      conversationId: id,
      ...createMessageDto,
    });
  }
}
