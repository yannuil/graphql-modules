// tslint:disable-next-line:no-reference
/// <reference path="../../../../node_modules/reflect-metadata/index.d.ts" />

import { GraphQLInputObjectType, GraphQLInputObjectTypeConfig, GraphQLInputFieldConfig, GraphQLInputType } from 'graphql';
import { Type, DESIGN_TYPE } from './common';
import { getScalarTypeFromClass } from '.';

const GRAPHQL_INPUT_OBJECT_TYPE_CONFIG = Symbol('graphql:input-object-type-config');
const GRAPHQL_INPUT_TYPE = Symbol('graphql:input-type');

export interface InputFieldDecoratorConfig<TResult> {
  name?: string;
  type?: Type<TResult> | GraphQLInputType;
}

export function InputFieldProperty<TSource>(inputFieldDecoratorConfig: InputFieldDecoratorConfig<TSource> = {}): PropertyDecorator {
  return (target: TSource, propertyKey) => {
    const existingConfig = Reflect.getMetadata(GRAPHQL_INPUT_OBJECT_TYPE_CONFIG, target.constructor) || {};
    const inputFieldName = inputFieldDecoratorConfig.name || propertyKey;
    const inputFieldType = inputFieldDecoratorConfig.type || Reflect.getMetadata(DESIGN_TYPE, target, propertyKey);
    const inputFieldGraphQLType = Reflect.getMetadata(GRAPHQL_INPUT_TYPE, inputFieldType) || getScalarTypeFromClass(inputFieldType) || inputFieldType;
    const inputFieldConfig: GraphQLInputFieldConfig = {
      type: inputFieldGraphQLType,
    };
    existingConfig.fields = existingConfig.fields || {};
    existingConfig.fields[inputFieldName] = {
      ...(existingConfig.fields[inputFieldName] || {}),
      ...inputFieldConfig,
    };
    Reflect.defineMetadata(GRAPHQL_INPUT_OBJECT_TYPE_CONFIG, existingConfig, target.constructor);
  };
}

export function InputObjectType(config ?: Partial<GraphQLInputObjectTypeConfig>): ClassDecorator {
  return target => {
    const existingConfig: GraphQLInputObjectTypeConfig = Reflect.getMetadata(GRAPHQL_INPUT_OBJECT_TYPE_CONFIG, target) || {};
    Reflect.defineMetadata(GRAPHQL_INPUT_TYPE, new GraphQLInputObjectType({
      name: target.name,
      ...existingConfig,
      ...(config || {}),
    }), target);
  };
}

export function getInputTypeFromClass<T>(target: Type<T>): GraphQLInputType {
  return Reflect.getMetadata(GRAPHQL_INPUT_TYPE, target);
}
