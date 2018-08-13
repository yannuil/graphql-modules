import { injectable, inject } from '@graphql-modules/core';
import { Users } from '../../3rd-party/users';

import data from './data';

@injectable()
export class Messages {
  constructor(@inject(Users) private users: Users) {}

  async chat(userId: number) {
    const me = await this.users.me();

    if (me.id === userId) {
      throw new Error(
        'You cannot talk with yourself, you weird, crazy person!',
      );
    }

    return data.filter(msg => {
      const ids = [msg.recipient, msg.sender];
      return ids.includes(me.id) && ids.includes(userId);
    });
  }
}
