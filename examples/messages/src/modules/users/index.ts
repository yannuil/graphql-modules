import { GraphQLModule } from '@graphql-modules/core';
import * as users from '../../3rd-party/users';

import { Users } from './providers/users';
import usersModule from '../../3rd-party/users';

export const appUsersModule = new GraphQLModule({
  name: 'app-users',
  dependencies: () => [usersModule],
  providers: [{ provide: users.Users, useClass: Users }],
});
