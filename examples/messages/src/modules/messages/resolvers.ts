import { ResolverMap } from '../../types';
import { Messages } from './messages.provider';
import { MessageDbObject } from './types';
import { Users } from '../../3rd-party/users';

const Message: ResolverMap = {
  sender(msg: MessageDbObject, _args, { injector }) {
    return injector.get(Users).user(msg.sender);
  },
  recipient(msg: MessageDbObject, _args, { injector }) {
    return injector.get(Users).user(msg.recipient);
  },
};

const Query: ResolverMap = {
  chat(_, args: { with: string }, { injector }) {
    return injector.get(Messages).chat(parseInt(args.with));
  },
};

export default { Query, Message };
