import { GraphQLModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '@graphql-modules/core';
import * as graphqlHTTP from 'express-graphql';
import * as express from 'express';

const users = [
  {
    id: '1',
    name: 'Ada Lovelace',
    birthDate: '1815-12-10',
    username: '@ada'
  },
  {
    id: '2',
    name: 'Alan Turing',
    birthDate: '1912-06-23',
    username: '@complete'
  }
];

const AccountsModule = new GraphQLModule({
  name: 'AccountsModule',
  typeDefs: () => [
    /* GraphQL */ `
      extend type Query {
        me: User
      }

      type User {
        id: ID!
        name: String
        username: String
      }
    `,
    getRemoteControlTypeDefs()
  ],
  resolvers: () => [
    {
      Query: {
        me() {
          return users[0];
        }
      }
    },
    getRemoteControlResolvers(AccountsModule, 'SECRET')
  ]
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: await AccountsModule.schemaAsync
  }))
);
app.listen(4001, () => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at 4001`);
});
