import { ResolverMap } from '../../../types';
import { Messages } from '../providers/messages';

const Query: ResolverMap = {
  chat(_, args: { with: number }, { injector }) {
    return injector.get(Messages).chat(args.with);
  },
};

export default { Query };
