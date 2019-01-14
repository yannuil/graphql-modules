import { GraphQLUnionType } from 'graphql';
import { GRAPHQL_SCALAR_TYPE, getScalarTypeFromClass } from './scalar-type';
import { Type } from './common';
import { GRAPHQL_OBJECT_TYPE } from './object-type';

interface UnionTypeDecoratorConfig<TResult> {
  name: string;
  types: Array<Type<TResult>>;
  resolveType: (...args: any[]) => Type<TResult>;
}

export function UnionType<TResult>(config: UnionTypeDecoratorConfig<TResult>) {
  return <T>(target: T) => {
    Reflect.defineMetadata(GRAPHQL_OBJECT_TYPE, new GraphQLUnionType({
      name: config.name,
      resolveType: (...args) => {
        const type = config.resolveType(...args);
        return Reflect.getMetadata(GRAPHQL_OBJECT_TYPE, type) || getScalarTypeFromClass(type) || type;
      },
      types: config.types.map(type => Reflect.getMetadata(GRAPHQL_OBJECT_TYPE, type) || getScalarTypeFromClass(type) || type),
    }), target);
    return target;
  };
}
