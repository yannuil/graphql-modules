import { GraphQLModule, getRemoteModule } from '@graphql-modules/core';
import * as graphqlHTTP from 'express-graphql';
import * as express from 'express';
import * as fetch from 'node-fetch';

const SECRET = 'SECRET';

function fetcherFactory(url: string) {
  return async (query, variables) => {
    const result = await fetch(url, {
      body: JSON.stringify({
        query,
        variables
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await result.json();
    return data;
  };
}

const gatewayModule = new GraphQLModule({
  imports: [
    getRemoteModule(fetcherFactory('http://localhost:4001/graphql'), SECRET),
    getRemoteModule(fetcherFactory('http://localhost:4002/graphql'), SECRET),
    getRemoteModule(fetcherFactory('http://localhost:4003/graphql'), SECRET),
    getRemoteModule(fetcherFactory('http://localhost:4004/graphql'), SECRET)
  ]
});

const app = express();
app.use(
  '/graphql',
  graphqlHTTP(async () => ({
    schema: await gatewayModule.schemaAsync,
    graphiql: true
  }))
);
app.listen(4000, () => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at 4000`);
});
