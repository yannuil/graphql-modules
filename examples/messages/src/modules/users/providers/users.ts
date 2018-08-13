import { injectable } from '@graphql-modules/core';
import * as users from '../../../3rd-party/users';

const data: users.User[] = [
  {
    id: 1,
    name: 'Kamil',
    phone: 'iPhone, sometimes Android phone',
  },
  {
    id: 2,
    name: 'Martyna',
  },
];

@injectable()
export class Users implements users.Users {
  async me() {
    return data.find(u => u.id === 1);
  }

  async users() {
    return data;
  }

  async user(id: number) {
    return data.find(u => u.id === id);
  }
}
