import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CurrentUser } from '../users/users.decorator';
import { UpdateMessageDTO, MessageDTO } from './dto/message.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  MessageQueryDTO,
  MessageQueryOutputDTO,
} from './dto/message-query.dto';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  //   @Get()
  //   @ApiOperation({ summary: 'Get message by query parameters' })
  //   @ApiOkResponse({
  //     description: 'Message retrieved successfully',
  //     type: MessageQueryOutputDTO,
  //   })
  //   @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  //   @ApiForbiddenResponse({
  //     description: 'User not authorized to view message',
  //   })
  //   @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  //   public async findByQuery(
  //     @CurrentUser() currentUser: AuthUserDTO,
  //     @Query() query: MessageQueryDTO,
  //   ): Promise<MessageQueryOutputDTO> {
  //     return this.messagesService.findByQuery(currentUser, query);
  //   } // TODO

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the message',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    description: 'Message retrieved successfully',
    type: MessageDTO,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this message',
  })
  @ApiNotFoundResponse({ description: 'message not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async findOne(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.messagesService.findOneById(currentUser, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update message by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the message',
    type: String,
    required: true,
  })
  @ApiBody({
    type: UpdateMessageDTO,
    description: 'Updated message data',
  })
  @ApiOkResponse({
    description: 'Message updated successfully',
    type: MessageDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid request data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  public async updateMy(
    @CurrentUser() currentUser: AuthUserDTO,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateMessageDto: UpdateMessageDTO,
  ) {
    return this.messagesService.update(currentUser, id, updateMessageDto);
  }
}
