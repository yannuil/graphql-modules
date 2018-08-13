import { GraphQLModule } from '@graphql-modules/core';

import { Messages } from './messages.provider';
import { appUsersModule } from '../users';
import resolvers from './resolvers';
import typeDefs from './schema';

export const appMessagesModule = new GraphQLModule({
  name: 'app-messages',
  typeDefs,
  resolvers,
  dependencies: () => [appUsersModule],
  providers: [Messages],
});
