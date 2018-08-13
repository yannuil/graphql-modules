import { injectable, inject } from '@graphql-modules/core';
import { Users } from '../../../3rd-party/users';

import { Message, MessageDbObject } from '../types';

const data: MessageDbObject[] = [];

@injectable()
export class Messages {
  constructor(@inject(Users) private users: Users) {}

  async chat(userId: number): Promise<MessageDbObject[]> {
    const me = await this.users.me();

    return data.filter(msg => {
      const ids = [msg.recipient, msg.sender];
      return ids.includes(me.id) && ids.includes(userId);
    });
  }
}
