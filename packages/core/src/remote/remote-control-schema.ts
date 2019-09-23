import { GraphQLModule } from '../graphql-module';
import { print, GraphQLScalarType, defaultFieldResolver } from 'graphql';

export function getRemoteControlTypeDefs() {
  return /* GraphQL */ `
    scalar JSON
    type Query {
      _graphqlModule: GraphQLModuleRemoteControl
    }
    type GraphQLModuleRemoteControl {
      typeDefs: String
      resolve(typeName: String, fieldName: String, root: JSON, args: JSON): JSON
      providerNames: [String]
      callProvider(providerName: String, methodName: String, args: JSON): JSON
    }
  `;
}

export function getRemoteControlResolvers(graphqlModule: GraphQLModule) {
  return {
    Query: {
      _graphqlModule: () => ({})
    },
    GraphQLModuleRemoteControl: {
      typeDefs: async () => {
        const typeDefs = await graphqlModule.typeDefsAsync;
        return print(typeDefs);
      },
      resolve: async (_: any, { typeName, fieldName, root, args }: any, context: any, info: any) => {
        const resolvers = await graphqlModule.resolversAsync;
        if (typeName in resolvers && fieldName in resolvers[typeName]) {
          return resolvers[typeName][fieldName](root, args, context, info);
        }
        if (fieldName === '__isTypeOf') {
          return true;
        }
        return defaultFieldResolver(root, args, context, info);
      },
      callProvider: async (_: any, { providerName, methodName, args }: any) => {
        const injector = await graphqlModule.injectorAsync;
        return injector.get(providerName)[methodName](...args);
      },
      providerNames: async () => {
        const injector = await graphqlModule.injectorAsync;
        return [...injector['_nameServiceIdentifierMap'].keys()];
      }
    },
    JSON: new GraphQLScalarType({
      name: 'JSON',
      serialize: v => JSON.stringify(v),
      parseValue: v => JSON.parse(v),
      parseLiteral: v => JSON.parse(v['value'])
    })
  };
}
