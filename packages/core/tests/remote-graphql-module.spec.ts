import { GraphQLModule, getRemoteModule, getRemoteControlTypeDefs, getRemoteControlResolvers } from '../src';
import { graphql } from 'graphql';
import { Injectable } from '@graphql-modules/di';
import 'reflect-metadata';

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
        getRemoteControlResolvers(multiplyModule)
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
        getRemoteControlResolvers(additionModule)
      ]
    });
    const operationModule = new GraphQLModule({
      imports: [getRemoteModule(createMockFetcher(multiplyModule)), getRemoteModule(createMockFetcher(additionModule))]
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
        getRemoteControlResolvers(barModule)
      ]
    });
    const fooModule = new GraphQLModule({
      imports: [getRemoteModule(createMockFetcher(barModule))],
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
      resolvers: () => [getRemoteControlResolvers(barModule)],
      providers: [BarProvider]
    });

    const fooModule = new GraphQLModule({
      name: 'Foo',
      imports: [getRemoteModule(createMockFetcher(barModule))],
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
});
