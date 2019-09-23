import { GraphQLModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '@graphql-modules/core';
import * as graphqlHTTP from 'express-graphql';
import * as express from 'express';

const usernames = [{ id: '1', username: '@ada' }, { id: '2', username: '@complete' }];
const reviews = [
  {
    id: '1',
    authorID: '1',
    product: { upc: '1' },
    body: 'Love it!'
  },
  {
    id: '2',
    authorID: '1',
    product: { upc: '2' },
    body: 'Too expensive.'
  },
  {
    id: '3',
    authorID: '2',
    product: { upc: '3' },
    body: 'Could be better.'
  },
  {
    id: '4',
    authorID: '2',
    product: { upc: '1' },
    body: 'Prefer something else.'
  }
];

const ReviewsModule = new GraphQLModule({
  name: 'ReviewsModule',
  typeDefs: () => [
    /* GraphQL */ `
      type Review {
        id: ID!
        body: String
        author: User
        product: Product
      }

      type User {
        id: ID!
        username: String
        reviews: [Review]
        numberOfReviews: Int
      }

      type Product {
        upc: String!
        reviews: [Review]
      }
    `,
    getRemoteControlTypeDefs()
  ],
  resolvers: () => [
    {
      Review: {
        author(review) {
          return { __typename: 'User', id: review.authorID };
        }
      },
      User: {
        reviews(user) {
          return reviews.filter(review => review.authorID === user.id);
        },
        numberOfReviews(user) {
          return reviews.filter(review => review.authorID === user.id).length;
        },
        username(user) {
          const found = usernames.find(username => username.id === user.id);
          return found ? found.username : null;
        }
      },
      Product: {
        reviews(product) {
          return reviews.filter(review => review.product.upc === product.upc);
        }
      }
    },
    getRemoteControlResolvers(ReviewsModule, 'SECRET')
  ]
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: await ReviewsModule.schemaAsync
  }))
);
app.listen(4002, () => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at 4002`);
});
