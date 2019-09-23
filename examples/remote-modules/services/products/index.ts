import { GraphQLModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '@graphql-modules/core';
import * as graphqlHTTP from 'express-graphql';
import * as express from 'express';

const products = [
  {
    upc: '1',
    name: 'Table',
    price: 899,
    weight: 100
  },
  {
    upc: '2',
    name: 'Couch',
    price: 1299,
    weight: 1000
  },
  {
    upc: '3',
    name: 'Chair',
    price: 54,
    weight: 50
  }
];

const ProductsModule = new GraphQLModule({
  name: 'ProductsModule',
  typeDefs: () => [
    /* GraphQL */ `
      extend type Query {
        topProducts(first: Int = 5): [Product]
      }

      type Product {
        upc: String!
        name: String
        price: Int
        weight: Int
      }
    `,
    getRemoteControlTypeDefs()
  ],
  resolvers: () => [
    {
      Query: {
        topProducts(_, args) {
          return products.slice(0, args.first);
        }
      }
    },
    getRemoteControlResolvers(ProductsModule, 'SECRET')
  ]
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: await ProductsModule.schemaAsync
  }))
);
app.listen(4003, () => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at 4003`);
});
