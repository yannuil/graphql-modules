// tslint:disable-next-line:no-reference
/// <reference path="../../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLInterfaceType, GraphQLInterfaceTypeConfig } from 'graphql';
import { GRAPHQL_OBJECT_TYPE, GRAPHQL_OBJECT_TYPE_CONFIG } from './object-type';

export function ResolveTypeMethod<TSource, TContext>(): MethodDecorator {
  return (target, propertyKey) => {
    const existingConfig: GraphQLInterfaceTypeConfig<TSource, TContext> = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target) || {};
    existingConfig.resolveType = (root, args) => target[propertyKey].call(root, ...Object['values'](args));
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function InterfaceType<TSource, TContext>(config ?: Partial<GraphQLInterfaceTypeConfig<TSource, TContext>>) {
  return target => {
    const existingConfig: GraphQLInterfaceTypeConfig<TSource, TContext> = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target) || {};
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE, new GraphQLInterfaceType({
      name: target.name,
      ...existingConfig,
      ...(config || {}),
    }), target);
  };
}
