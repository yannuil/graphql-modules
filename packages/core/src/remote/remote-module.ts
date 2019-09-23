import { Fetcher } from './types';
import {
  DocumentNode,
  parse,
  buildASTSchema,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLEnumType,
  GraphQLUnionType
} from 'graphql';
import { GraphQLModule } from '../graphql-module';
import { getClassProviderProxy } from './provider-proxy';
import { Provider } from '@graphql-modules/di';

export function getRemoteModule(fetcher: Fetcher) {
  const typeDefsAsync = new Promise<DocumentNode>(async (resolve, reject) => {
    try {
      const {
        data: {
          _graphqlModule: { typeDefs: typeDefsStr }
        }
      } = await fetcher(/* GraphQL */ `
        {
          _graphqlModule {
            typeDefs
          }
        }
      `);
      resolve(parse(typeDefsStr));
    } catch (e) {
      reject(e);
    }
  });
  const resolversAsync = new Promise<any>(async (resolve, reject) => {
    try {
      const typeDefs = await typeDefsAsync;
      const astSchema = buildASTSchema(typeDefs);
      const typeMap = astSchema.getTypeMap();
      const resolvers: any = {};
      for (const typeName in typeMap) {
        const type = typeMap[typeName];
        if (type instanceof GraphQLScalarType) {
          /* TODO */
        } else if (type instanceof GraphQLEnumType) {
          /* TODO */
        } else if (type instanceof GraphQLUnionType) {
          /* TODO */
        } else if (type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType) {
          const typeResolvers: any = (resolvers[typeName] = {});
          const fieldMap = type.getFields();
          for (const fieldName in fieldMap) {
            typeResolvers[fieldName] = async (root: any, args: any) => {
              const {
                data: {
                  _graphqlModule: { resolve: returnData }
                }
              } = await fetcher(
                /* GraphQL */ `
                  query TypeResolversFieldName($typeName: String, $fieldName: String, $root: JSON, $args: JSON) {
                    _graphqlModule {
                      resolve(typeName: $typeName, fieldName: $fieldName, root: $root, args: $args)
                    }
                  }
                `,
                { typeName, fieldName, root: JSON.stringify(root), args: JSON.stringify(args) }
              );
              return JSON.parse(returnData);
            };
          }
          if (type instanceof GraphQLObjectType) {
            typeResolvers.__isTypeOf = async (root: any) => {
              const {
                data: {
                  _graphqlModule: { resolve: returnData }
                }
              } = await fetcher(
                /* GraphQL */ `
                  query TypeResolversisTypeOf($typeName: String, $fieldName: String, $root: JSON) {
                    _graphqlModule {
                      resolve(typeName: $typeName, fieldName: $fieldName, root: $root)
                    }
                  }
                `,
                { typeName, fieldName: '__isTypeOf', root: JSON.stringify(root) }
              );
              return JSON.parse(returnData);
            };
          }
          if (type instanceof GraphQLInterfaceType) {
            typeResolvers.__resolveType = async (root: any) => {
              const {
                data: {
                  _graphqlModule: { resolve: returnData }
                }
              } = await fetcher(
                /* GraphQL */ `
                  query TypeResolversresolveType($typeName: String, $fieldName: String, $root: JSON) {
                    _graphqlModule {
                      resolve(typeName: $typeName, fieldName: $fieldName, root: $root)
                    }
                  }
                `,
                { typeName, fieldName: '__resolveType', root: JSON.stringify(root) }
              );
              return JSON.parse(returnData);
            };
          }
        }
      }
      resolve(resolvers);
    } catch (e) {
      reject(e);
    }
  });
  const providersAsync = new Promise<Provider[]>(async (resolve, reject) => {
    try {
      const {
        data: {
          _graphqlModule: { providerNames }
        }
      } = await fetcher(/* GraphQL */ `
        {
          _graphqlModule {
            providerNames
          }
        }
      `);
      const providers = [];
      for (const providerName of providerNames) {
        providers.push(getClassProviderProxy(fetcher, providerName));
      }
      resolve(providers);
    } catch (e) {
      reject(e);
    }
  });
  return new GraphQLModule({
    typeDefs: typeDefsAsync,
    resolvers: resolversAsync,
    providers: providersAsync
  });
}
