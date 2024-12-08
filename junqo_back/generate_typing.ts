import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import * as path from 'path';
import { existsSync } from 'fs';

async function generateTypes() {
  try {
    const schemasPath = process.env.GRAPHQL_SCHEMAS_PATH
      ? path.resolve(process.env.GRAPHQL_SCHEMAS_PATH)
      : path.resolve(__dirname, '../schemas');

    if (!existsSync(schemasPath)) {
      throw new Error(`Schemas directory not found: ${schemasPath}`);
    }

    const outputPath = path.resolve(__dirname, 'src', 'graphql.schema.ts');

    const definitionsFactory = new GraphQLDefinitionsFactory();

    await definitionsFactory.generate({
      typePaths: [path.join(schemasPath, '**/*.graphql')],
      path: outputPath,
      outputAs: 'class',
      watch: process.env.NODE_ENV === 'development',
    });

    console.log(`Types generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate GraphQL types:', error);
    process.exit(1);
  }
}

generateTypes().catch((error) => {
  console.error('Unhandled error in generateTypes:', error);
  process.exit(1);
});
