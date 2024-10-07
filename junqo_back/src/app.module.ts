// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['../schemas/**/*.graphql'],
      // Generate typePaths
      definitions: {
        path: process.cwd() + 'src/graphql.ts',
      },
      // playground: false, // Disable playground and debug
    }),
  ],
})
export class AppModule {}
