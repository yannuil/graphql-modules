import { GraphQLUnionType } from 'graphql';
import { getScalarTypeFromClass } from './scalar-type';
import { GRAPHQL_OBJECT_TYPE } from './object-type';
import { AnyType } from './common';

interface UnionTypeDecoratorConfig<TTypes extends AnyType[]> {
  name: string;
  types: TTypes;
  resolveType: (...args: any[]) => TTypes[any];
}

export function UnionType<TTypes extends Array<new (...args: any[]) => any>>(config: UnionTypeDecoratorConfig<TTypes>) {
  return (target: any): TTypes[any] => {
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
