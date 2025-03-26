import {
  Catch,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException) {
    console.log(JSON.stringify(exception));
    let constraints: string[];

    try {
      const response = exception.getResponse() as any;
      if (
        typeof response === 'object' &&
        response.message &&
        Array.isArray(response.message)
      ) {
        constraints = response.message.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : [],
        );
      } else {
        constraints = [exception.message];
      }
      const message = constraints.join(', ');

      return new BadRequestException(message);
    } catch (error) {
      return new InternalServerErrorException(
        'An error occurred while processing the outputted BadRequestException',
      );
    }
  }
}
