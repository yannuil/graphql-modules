import { ObjectType, FieldMethod } from '@graphql-modules/utils';
import { Author } from './author';
import { AUTHORS, POSTS } from './collections';
import { Post } from './post';

@ObjectType()
export class Query {
  @FieldMethod({ type: [Author] })
  authors(): Author[] {
    return AUTHORS;
  }
  @FieldMethod({ type: [Post] })
  posts(): Post[] {
    return POSTS;
  }
}
