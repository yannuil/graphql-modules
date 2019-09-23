import { GraphQLModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '@graphql-modules/core';
import * as graphqlHTTP from 'express-graphql';
import * as express from 'express';

const inventory = [{ upc: '1', inStock: true }, { upc: '2', inStock: false }, { upc: '3', inStock: true }];

const InventoryModule = new GraphQLModule({
  name: 'InventoryModule',
  typeDefs: [
    /* GraphQL */ `
      type Product {
        upc: String!
        weight: Int
        price: Int
        inStock: Boolean
        shippingEstimate: Int
      }
    `,
    getRemoteControlTypeDefs()
  ],
  resolvers: () => [
    {
      Product: {
        shippingEstimate(object) {
          // free for expensive items
          if (object.price > 1000) return 0;
          // estimate is based on weight
          return object.weight * 0.5;
        }
      }
    },
    getRemoteControlResolvers(InventoryModule, 'SECRET')
  ]
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: await InventoryModule.schemaAsync
  }))
);
app.listen(4004, () => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at 4004`);
});
