import {
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsValidationException } from './socket-validation-pipe';

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    // Check if it's our custom validation exception with event context
    let eventName = 'unknown';
    if (exception instanceof WsValidationException && exception.eventName) {
      eventName = exception.eventName;
    }

    // Map event names to their corresponding error events
    const errorEventMap: Record<string, string> = {
      joinRoom: 'joinRoomError',
      leaveRoom: 'leaveRoomError',
      sendMessage: 'messageError',
      updateMessage: 'updateMessageError',
      deleteMessage: 'deleteMessageError',
      getMessageHistory: 'messageHistoryError',
      startTyping: 'typingError',
      stopTyping: 'typingError',
      markMessageRead: 'markReadError',
      getOnlineUsers: 'onlineUsersError',
    };

    const errorEvent = errorEventMap[eventName] || 'error';

    // Handle different exception types
    if (exception instanceof HttpException) {
      // Use the HTTP exception's message directly for consistency with REST API
      client.emit(errorEvent, {
        message: exception.message,
        statusCode: exception.getStatus(),
        error: this.getErrorType(exception),
      });
    } else {
      // Handle WsException (including validation errors)
      const error = exception.getError();
      client.emit(errorEvent, {
        message:
          typeof error === 'string'
            ? error
            : (error as any)?.message || 'Operation failed',
        error: typeof error === 'string' ? error : error,
      });
    }
  }

  private getErrorType(exception: HttpException): string {
    if (exception instanceof NotFoundException) {
      return 'NOT_FOUND';
    } else if (exception instanceof ForbiddenException) {
      return 'FORBIDDEN';
    } else if (exception instanceof BadRequestException) {
      return 'BAD_REQUEST';
    } else if (exception instanceof UnauthorizedException) {
      return 'UNAUTHORIZED';
    } else if (exception instanceof InternalServerErrorException) {
      return 'INTERNAL_SERVER_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }
}
