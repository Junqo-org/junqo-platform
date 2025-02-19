import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import * as path from 'path';
import { existsSync } from 'fs';
import 'dotenv/config';

async function generateTypes() {
  try {
    const schemasPath = process.env.GRAPHQL_SCHEMAS_PATH
      ? path.resolve(process.env.GRAPHQL_SCHEMAS_PATH)
      : path.join(process.cwd(), '..', 'schemas');

    if (!existsSync(schemasPath)) {
      throw new Error(`Schemas directory not found: ${schemasPath}`);
    }

    const outputPath = path.resolve(process.cwd(), 'src', 'graphql.schema.ts');

    const definitionsFactory = new GraphQLDefinitionsFactory();

    await definitionsFactory.generate({
      typePaths: [path.join(schemasPath, '**/*.graphql')],
      path: outputPath,
      outputAs: 'class',
      watch: process.env.WATCH_TYPES === 'true',
    });

    console.log(`Types generated successfully at: ${outputPath}`);
    process.exit(0); // Explicitly exit the script
  } catch (error) {
    console.error('Failed to generate GraphQL types:', error);
    process.exit(1);
  }
}

generateTypes().catch((error) => {
  console.error('Unhandled error in generateTypes:', error);
  process.exit(1);
});
