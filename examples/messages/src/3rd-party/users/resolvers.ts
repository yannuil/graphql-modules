import { ResolverMap } from '../../types';
import { Users } from './users.provider';

const Query: ResolverMap = {
  me(_, _args, { injector }) {
    return injector.get(Users).me();
  },
  users(_, _args, { injector }) {
    return injector.get(Users).users();
  },
};

export default { Query };
