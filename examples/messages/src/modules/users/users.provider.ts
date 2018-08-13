import { injectable } from '@graphql-modules/core';
import * as users from '../../3rd-party/users';

import data from './data';

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
