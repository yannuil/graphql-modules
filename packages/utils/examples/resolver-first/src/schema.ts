import { GraphQLSchema } from 'graphql';
import { getObjectTypeFromClass } from '@graphql-modules/utils';
import { Query } from './query';

export const schema = new GraphQLSchema({
  query: getObjectTypeFromClass(Query),
});
