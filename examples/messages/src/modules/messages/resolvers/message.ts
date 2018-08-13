import { ResolverMap } from '../../../types';
import { MessageDbObject } from '../types';
import { Users } from '../../../3rd-party/users';

const Message: ResolverMap = {
  sender(msg: MessageDbObject, _args, { injector }) {
    return injector.get(Users).user(msg.sender);
  },
  recipient(msg: MessageDbObject, _args, { injector }) {
    return injector.get(Users).user(msg.recipient);
  },
};

export default { Message };
