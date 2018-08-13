import { ResolverMap } from '../../../types';
import { Users } from '../providers/users';

const Query: ResolverMap = {
  me(_, _args, { injector }) {
    return injector.get(Users).me();
  },
  users(_, _args, { injector }) {
    return injector.get(Users).users();
  },
};

export default { Query };
