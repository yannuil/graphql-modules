import { ObjectType, FieldProperty, FieldMethod, InputObjectType } from '@graphql-modules/utils';
import { Post } from './post';
import { POSTS } from './collections';

@ObjectType()
@InputObjectType({ name: 'AuthorInput' })
export class Author {
  constructor({ id, name }: any) {
    this.id  = id;
    this.name = name;
  }
  @FieldProperty()
  id: number;
  @FieldProperty()
  name: string;
  @FieldMethod({
    type: [Post],
  })
  posts(): Post[] {
    return POSTS.filter(({ authorId }) => authorId === this.id);
  }
}
