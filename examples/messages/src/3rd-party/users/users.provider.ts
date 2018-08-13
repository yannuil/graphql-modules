import { User } from './types';

export class Users {
  me: () => Promise<User | null>;
  users: () => Promise<User[]>;
  user: (id: number) => Promise<User | null>;
}
