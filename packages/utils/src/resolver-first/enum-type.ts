import { GraphQLEnumTypeConfig, GraphQLEnumType, GraphQLEnumValueConfig } from 'graphql';
import { GRAPHQL_SCALAR_TYPE } from './scalar-type';

export function EnumType(config ?: Partial<GraphQLEnumTypeConfig>) {
  return <Enum>(target: Enum) => {
    const values: { [key: string ]: GraphQLEnumValueConfig } = {} as any;
    // tslint:disable-next-line:forin
    for ( const key in target ) {
      values[key] = {
        value: key,
      };
    }
    Reflect.defineMetadata(GRAPHQL_SCALAR_TYPE, new GraphQLEnumType({
      values,
      ...(config || {}),
    } as any), target);
    return target;
  };
}
