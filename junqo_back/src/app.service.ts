import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Junqo API !\nTo interact with the graphql API use POST requests to /graphql.';
  }
}
