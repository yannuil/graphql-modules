// tslint:disable-next-line:no-reference
/// <reference path="../../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLScalarTypeConfig, GraphQLScalarType, GraphQLString, GraphQLFloat, GraphQLBoolean, GraphQLNamedType, GraphQLList } from 'graphql';
import { Type } from './common';

export const GRAPHQL_SCALAR_TYPE = Symbol('graphql:scalar-type');

export function ScalarType<TInternal, TExternal>(config ?: Partial<GraphQLScalarTypeConfig<TInternal, TExternal>>): ClassDecorator {
  return target => {
    Reflect.defineMetadata(GRAPHQL_SCALAR_TYPE, new GraphQLScalarType({
      name: target.name,
      parseValue: obj => Object.assign(Reflect.construct(target, []), obj) as TInternal,
      parseLiteral: obj => Object.assign(Reflect.construct(target, []), obj) as TInternal,
      serialize: instance => Object.assign({}, instance),
      ...(config || {}),
    }), target);
  };
}

const DEFAULT_SCALAR_TYPE_MAP = new Map<Type<any>, GraphQLScalarType>([
  [String, GraphQLString],
  [Number, GraphQLFloat],
  [Boolean, GraphQLBoolean],
]);

export function getScalarTypeFromClass<T>(target: Type<T> | object) {
  if (target instanceof Array) {
    const elementType = getScalarTypeFromClass(target[0]);
    return elementType && new GraphQLList(elementType);
  }
  return DEFAULT_SCALAR_TYPE_MAP.get(target as Type<T>) || Reflect.getMetadata(GRAPHQL_SCALAR_TYPE, target);
}
