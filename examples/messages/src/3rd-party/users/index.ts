import { GraphQLModule } from '@graphql-modules/core';

import resolvers from './resolvers';
import typeDefs from './schema';

export default new GraphQLModule({
  name: 'users',
  typeDefs,
  resolvers,
});

export * from './users.provider';
export * from './types';
