import { Socket } from 'socket.io';
import { SocketValidationPipe } from './socket-validation-pipe';
import { WsException } from '@nestjs/websockets';

export class ValidationHelper {
  private static validationPipe = new SocketValidationPipe();

  static async validateAndHandle<T>(
    client: Socket,
    payload: any,
    dtoClass: new () => T,
    errorEvent: string,
  ): Promise<T | null> {
    try {
      const validated = await this.validationPipe.transform(payload, {
        metatype: dtoClass,
        type: 'body',
        data: undefined,
      });
      return validated;
    } catch (error) {
      if (error instanceof WsException) {
        client.emit(errorEvent, {
          message: 'Validation failed',
          error: error.getError(),
          timestamp: new Date().toISOString(),
        });
      } else {
        client.emit(errorEvent, {
          message: 'Validation failed',
          error: error.message || 'Unknown validation error',
          timestamp: new Date().toISOString(),
        });
      }
      return null;
    }
  }
}
