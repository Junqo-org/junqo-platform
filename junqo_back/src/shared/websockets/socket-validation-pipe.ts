import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { WsException } from '@nestjs/websockets';

// Define a more explicit type for class constructors
type ClassConstructor = new (...args: any[]) => any;

// Custom exception that includes event context
export class WsValidationException extends WsException {
  constructor(
    message: string,
    public eventName?: string,
  ) {
    super(message);
  }
}

@Injectable()
export class SocketValidationPipe implements PipeTransform<any> {
  constructor(private eventName?: string) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Check if value is null or undefined
    if (value === null || value === undefined) {
      throw new WsValidationException(
        'Validation failed: Payload cannot be null or undefined',
        this.eventName,
      );
    }

    try {
      // Ensure we have a valid object to transform
      const objectToTransform = typeof value === 'object' ? value : {};

      // WebSocket data is already parsed as an object, no need to JSON.parse
      const object = plainToClass(metatype, objectToTransform);

      // Verify the object was created properly before validation
      if (!object || typeof object !== 'object') {
        throw new WsValidationException(
          'Validation failed: Unable to transform payload to expected type',
          this.eventName,
        );
      }

      const errors = await validate(object);
      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');
        throw new WsValidationException(
          `Validation failed: ${errorMessages}`,
          this.eventName,
        );
      }
      return object; // Return the validated and transformed object
    } catch (error) {
      // If it's already a WsValidationException, re-throw it
      if (error instanceof WsValidationException) {
        throw error;
      }

      // Handle any other transformation/validation errors
      throw new WsValidationException(
        `Validation failed: ${error.message || 'Unknown validation error'}`,
        this.eventName,
      );
    }
  }

  private toValidate(metatype: ClassConstructor): boolean {
    const types: ClassConstructor[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
