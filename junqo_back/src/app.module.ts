// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [
        process.env.GRAPHQL_SCHEMAS_PATH || '../schemas/**/*.graphql',
      ],
      // Generate typePaths
      definitions: {
        path: path.join(process.cwd(), 'src', 'graphql.ts'),
      },
      playground: process.env.NODE_ENV === 'production' ? false : true,
    }),
  ],
})
export class AppModule {}
