import { GraphQLApp } from '@graphql-modules/core';

import usersModule from './3rd-party/users';
import { appUsersModule } from './modules/users';
import { appMessagesModule } from './modules/messages';

export const app = new GraphQLApp({
  modules: [usersModule, appUsersModule, appMessagesModule],
});
