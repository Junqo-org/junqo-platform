import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import * as path from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: [
    path.join(
      process.env.GRAPHQL_SCHEMAS_PATH || '../schemas',
      '/**/*.graphql',
    ),
  ],
  path: path.join(process.cwd(), 'src', 'graphql.schema.ts'),
  outputAs: 'class',
});
