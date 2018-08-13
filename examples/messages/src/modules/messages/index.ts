import { GraphQLModule } from '@graphql-modules/core';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { loadSchemaFiles, loadResolversFiles } from '@graphql-modules/sonar';
import { resolve } from 'path';

import { Messages } from './providers/messages';
import { appUsersModule } from '../users';

export const appMessagesModule = new GraphQLModule({
  name: 'app-messages',
  typeDefs: mergeGraphQLSchemas(
    loadSchemaFiles(resolve(__dirname, './schema')),
  ),
  resolvers: mergeResolvers(
    loadResolversFiles(resolve(__dirname, './resolvers')),
  ),
  dependencies: () => [appUsersModule],
  providers: [Messages],
});
