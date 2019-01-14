import { ObjectType, FieldProperty, FieldMethod, InputFieldProperty, InputObjectType } from '@graphql-modules/utils';
import { Author } from './author';
import { AUTHORS } from './collections';

@ObjectType()
@InputObjectType({ name: 'PostInput' })
export class Post {
  constructor({ id, title, content, authorId }: any) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.authorId = authorId;
  }
  @InputFieldProperty()
  @FieldProperty()
  id: number;
  @InputFieldProperty()
  @FieldProperty()
  title: string;
  @InputFieldProperty()
  @FieldProperty()
  content: string;
  @FieldMethod()
  author(): Author {
    return AUTHORS.find(({ id }) => id === this.authorId);
  }
  @InputFieldProperty()
  authorId: number;
}
