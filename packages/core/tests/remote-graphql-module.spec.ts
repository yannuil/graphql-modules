import { GraphQLModule, getRemoteModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '../src';
import { graphql } from 'graphql';
import { Injectable } from '@graphql-modules/di';
import 'reflect-metadata';

const SECRET = 'SECRET';

function createMockFetcher(graphqlModule: GraphQLModule) {
  return async (operation: string, variableValues?: any) => {
    const schema = await graphqlModule.schemaAsync;
    const result = await graphql({
      schema,
      source: operation,
      contextValue: {},
      variableValues
    });
    return result;
  };
}
describe('GraphQL Remote Module', () => {
  it('should handle Query operations from remote modules', async () => {
    const multiplyModule = new GraphQLModule({
      typeDefs: () => [
        /* GraphQL */ `
          type Query {
            multiply(x: Int, y: Int): Int
          }
        `,
        getRemoteControlTypeDefs()
      ],
      resolvers: () => [
        {
          Query: {
            multiply: (_, { x, y }) => x * y
          }
        },
        getRemoteControlResolvers(multiplyModule, SECRET)
      ]
    });
    const additionModule = new GraphQLModule({
      typeDefs: () => [
        /* GraphQL */ `
          type Query {
            add(x: Int, y: Int): Int
          }
        `,
        getRemoteControlTypeDefs()
      ],
      resolvers: () => [
        {
          Query: {
            add: (_, { x, y }) => x + y
          }
        },
        getRemoteControlResolvers(additionModule, SECRET)
      ]
    });
    const operationModule = new GraphQLModule({
      imports: [
        getRemoteModule(createMockFetcher(multiplyModule), SECRET),
        getRemoteModule(createMockFetcher(additionModule), SECRET)
      ]
    });
    await operationModule.injectorAsync;
    const schema = await operationModule.schemaAsync;
    const result = await graphql({
      schema,
      source: /* GraphQL */ `
        {
          multiply(x: 2, y: 3)
          add(x: 2, y: 3)
        }
      `
    });
    expect(result.data.multiply).toBe(6);
    expect(result.data.add).toBe(5);
  });
  it('should handle field resolvers from remote modules', async () => {
    const barModule = new GraphQLModule({
      typeDefs: () => [
        /* GraphQL */ `
          type Foo {
            bar: String
          }
        `,
        getRemoteControlTypeDefs()
      ],
      resolvers: () => [
        {
          Foo: {
            bar: root => 'BAR of ' + root.id
          }
        },
        getRemoteControlResolvers(barModule, SECRET)
      ]
    });
    const fooModule = new GraphQLModule({
      imports: [getRemoteModule(createMockFetcher(barModule), SECRET)],
      typeDefs: /* GraphQL */ `
        type Foo {
          id: ID
        }
        type Query {
          foo: Foo
        }
      `,
      resolvers: {
        Query: {
          foo: () => ({ id: 'FOO' })
        }
      }
    });
    await fooModule.injectorAsync;
    const schema = await fooModule.schemaAsync;
    const result = await graphql({
      schema,
      source: /* GraphQL */ `
        {
          foo {
            bar
          }
        }
      `
    });
    expect(result.data.foo.bar).toBe('BAR of FOO');
  });
  it('should handle class providers from remote module', async () => {
    @Injectable()
    class BarProvider {
      getBar(id: string): string {
        return 'BAR of ' + id;
      }
    }
    const barModule = new GraphQLModule({
      name: 'Bar',
      typeDefs: () => [getRemoteControlTypeDefs()],
      resolvers: () => [getRemoteControlResolvers(barModule, SECRET)],
      providers: [BarProvider]
    });

    const fooModule = new GraphQLModule({
      name: 'Foo',
      imports: [getRemoteModule(createMockFetcher(barModule), SECRET)],
      typeDefs: /* GraphQL */ `
        type Foo {
          id: ID
          bar: String
        }
        type Query {
          foo: Foo
        }
      `,
      resolvers: {
        Query: {
          foo: () => ({ id: 'FOO' })
        },
        Foo: {
          bar: ({ id }, _, { injector }) => injector.get<BarProvider>('BarProvider').getBar(id)
        }
      }
    });
    await fooModule.injectorAsync;
    const schema = await fooModule.schemaAsync;
    const result = await graphql({
      schema,
      source: /* GraphQL */ `
        {
          foo {
            bar
          }
        }
      `
    });
    expect(result.data.foo.bar).toBe('BAR of FOO');
  });
  it('should handle non-GraphQL Module implementation', async () => {
    // This represents a non-GraphQL Module implementation just returns the necessary things regarding to the operation and variables
    const barModuleFetcher = async (operation: string, variables: any) => {
      if (operation.includes('query TypeDefs')) {
        return {
          data: {
            _graphqlModule: {
              typeDefs: /* GraphQL */ `
                type Foo {
                  bar: String
                }
              `
            }
          }
        };
      } else if (operation.includes('resolve(')) {
        if (variables.typeName === 'Foo') {
          if (variables.fieldName === 'bar') {
            const rootObj = JSON.parse(variables.root);
            const returnData = 'BAR of ' + rootObj.id;
            return { data: { _graphqlModule: { resolve: JSON.stringify(returnData) } } };
          } else if (variables.fieldName === '__isTypeOf') {
            const returnData = true;
            return { data: { _graphqlModule: { resolve: JSON.stringify(returnData) } } };
          }
        }
      }
      return { data: { _graphqlModule: {} } };
    };
    const fooModule = new GraphQLModule({
      imports: [getRemoteModule(barModuleFetcher, SECRET)],
      typeDefs: /* GraphQL */ `
        type Foo {
          id: ID
        }
        type Query {
          foo: Foo
        }
      `,
      resolvers: {
        Query: {
          foo: () => ({ id: 'FOO' })
        }
      }
    });
    await fooModule.injectorAsync;
    const schema = await fooModule.schemaAsync;
    const result = await graphql({
      schema,
      source: /* GraphQL */ `
        {
          foo {
            bar
          }
        }
      `
    });
    expect(result.data.foo.bar).toBe('BAR of FOO');
  });
});
