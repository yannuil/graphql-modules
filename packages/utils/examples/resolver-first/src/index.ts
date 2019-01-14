import { schema } from './schema';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

app.listen(4000);
