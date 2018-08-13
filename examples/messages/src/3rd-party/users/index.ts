import { GraphQLModule } from '@graphql-modules/core';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { loadSchemaFiles, loadResolversFiles } from '@graphql-modules/sonar';
import { resolve } from 'path';

export default new GraphQLModule({
  name: 'users',
  typeDefs: mergeGraphQLSchemas(
    loadSchemaFiles(resolve(__dirname, './schema')),
  ),
  resolvers: mergeResolvers(
    loadResolversFiles(resolve(__dirname, './resolvers')),
  ),
});

export * from './providers/users';
export * from './types';
