import { Injector } from '@graphql-modules/core';

export interface Context {
  injector: Injector;
}

export interface ResolverMap {
  [key: string]: Resolver;
}

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any,
) => any;
