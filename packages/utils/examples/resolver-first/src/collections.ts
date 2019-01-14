import { Author } from './author';
import { Post } from './post';

export const AUTHORS = [
  new Author({ id: 0, name: 'Kamil' }),
  new Author({ id: 1, name: 'Niccolo'}),
];

export const POSTS = [
  new Post({ id: 0, title: 'Hello Niccolo', content: 'How are you?', authorId: 0 }),
  new Post({ id: 1, title: 'Hello Kamil', content: 'Good', authorId: 1 }),
];
