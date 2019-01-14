// tslint:disable-next-line:no-reference
/// <reference path="../../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLFieldConfig, GraphQLInputType, GraphQLArgumentConfig, GraphQLNamedType, GraphQLList } from 'graphql';
import { ObjectValue, Type, DESIGN_PARAMTYPES, DESIGN_TYPE, DESIGN_RETURNTYPE, AnyType } from './common';
import { getScalarTypeFromClass } from './scalar-type';
import { getInputTypeFromClass } from './input-object-type';

export const GRAPHQL_OBJECT_TYPE_CONFIG = Symbol('graphql:object-type-config');
export const GRAPHQL_OBJECT_TYPE = Symbol('graphql:object-type');

export type FieldResolver<TSource, TArgs, TResult> = (
  this: TSource,
  ...args: Array<ObjectValue<TArgs>>
) => Promise<TResult> | TResult;

export interface FieldDecoratorConfig<TSource, TArgs, TResult> {
  name?: string;
  type?: Type<TResult> | GraphQLObjectType | AnyType | unknown;
  resolve?: FieldResolver<TSource, TArgs, TResult>;
}

export interface ArgumentParameterDecoratorConfig {
  name: string;
  type?: AnyType | GraphQLInputType;
  fieldName?: string;
}

export function ArgumentParameter<TSource, TContext, TArgs>(argumentParameterConfig: ArgumentParameterDecoratorConfig): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = argumentParameterConfig.fieldName || propertyKey;
    const argumentName = argumentParameterConfig.name;
    const argumentType = argumentParameterConfig.type || Reflect.getMetadata(DESIGN_PARAMTYPES, target, propertyKey)[parameterIndex];
    const argumentGraphQLInputType = getInputTypeFromClass(argumentType) || getScalarTypeFromClass(argumentType) || argumentType;
    const argumentConfig: GraphQLArgumentConfig = {
      type: argumentGraphQLInputType,
    };
    const fieldConfig: Partial<GraphQLFieldConfig<TSource, TContext, TArgs>> = {
      args: {
        [argumentName]: argumentConfig,
      },
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = existingConfig.fields[fieldName] || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function FieldProperty<TSource, TContext, TArgs, TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): PropertyDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
    const fieldGraphQLType = getObjectTypeFromClass(fieldType) || getScalarTypeFromClass(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve;
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: fieldResolver && ((root, args) => fieldResolver.call(root, ...Object['values'](args))), // TODO: NOT SAFE
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}
export function FieldMethod<TSource, TContext, TArgs, TResult>(fieldDecoratorConfig: FieldDecoratorConfig<TSource, TArgs, TResult> = {}): MethodDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const fieldName = fieldDecoratorConfig.name || propertyKey;
    const fieldType = fieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_RETURNTYPE, target, propertyKey);
    const fieldGraphQLType = getObjectTypeFromClass(fieldType) || getScalarTypeFromClass(fieldType) || fieldType;
    const fieldResolver = fieldDecoratorConfig.resolve || target[propertyKey];
    const fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs> = {
      type: fieldGraphQLType,
      resolve: (root, args) => fieldResolver.call(root, ...Object['values'](args)), // TODO: NOT SAFE
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[fieldName] = {
      ...(existingConfig.fields[fieldName] || {}),
      ...fieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function ObjectType<TSource, TContext>(config ?: Partial<GraphQLObjectTypeConfig<TSource, TContext>>): ClassDecorator {
  return target => {
    const existingConfig: GraphQLObjectTypeConfig<TSource, TContext> = Reflect.getMetadata(GRAPHQL_OBJECT_TYPE_CONFIG, target) || {};
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE, new GraphQLObjectType({
      name: target.name,
      ...existingConfig,
      ...(config || {}),
    }), target);
  };
}

export function getObjectTypeFromClass<T>(target: Type<T> | unknown) {
  if (target instanceof Array) {
    const elementType = getObjectTypeFromClass(target[0]);
    return elementType && new GraphQLList(elementType);
  }
  return Reflect.getMetadata(GRAPHQL_OBJECT_TYPE, target as Type<T>);
}
