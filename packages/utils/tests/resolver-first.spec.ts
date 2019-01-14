import 'reflect-metadata';
import {
  ObjectType,
  getObjectTypeFromClass,
  FieldProperty, FieldMethod, ArgumentParameter, InputObjectType, getInputTypeFromClass, InputFieldProperty, InterfaceType, EnumType, getScalarTypeFromClass, ScalarType, UnionType } from '../src/resolver-first';
import { printType, graphql, GraphQLSchema, GraphQLObjectType, print, GraphQLInterfaceType } from 'graphql';
function stripWhitespaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

describe('ResolverFirst', async () => {
  describe('Object Type', async () => {
    it('should build object type using ObjectType decorator', async () => {
      @ObjectType()
      class Foo { }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Foo)))).toBe(stripWhitespaces(`
        type Foo {

        }
      `));
    });
    it('should build object type with scalar fields using FieldProperty decorator', async () => {
      @ObjectType()
      class Foo {
        @FieldProperty()
        bar: string;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Foo)))).toBe(stripWhitespaces(`
        type Foo {
          bar: String
        }
      `));
    });
    it('should add resolvers to the fields using FieldProperty decorator', async () => {
      @ObjectType()
      class Query {
        @FieldProperty({
          resolve: () => 'BAR',
        })
        bar: string;
      }
      const result = await graphql(new GraphQLSchema({
        query: getObjectTypeFromClass(Query) as GraphQLObjectType,
      }), `{ bar }`);
      expect(result.errors).toBeFalsy();
      expect(result.data.bar).toBe('BAR');
    });
    it('should add resolver to the fields using FieldMethod decorator by passing correct root value', async () => {
      @ObjectType()
      class Bar {
        // entity fields passed into constructor
        constructor(private message: string) { }
        @FieldMethod()
        messageLength(): number {
          return this.getLength(this.message);
        }
        // sample helper method
        private getLength(str: string): number {
          return str.length;
        }
      }
      @ObjectType()
      class Query {
        @FieldMethod()
        bar(): Bar {
          return new Bar('BAR');
        }
      }
      const result = await graphql(new GraphQLSchema({
        query: getObjectTypeFromClass(Query) as GraphQLObjectType,
      }), `{ bar { messageLength } }`);
      expect(result.errors).toBeFalsy();
      expect(result.data.bar.messageLength).toBe(3);
    });
    it('should add resolver to the fields with the arguments using ArgumentParameter decorator', async () => {
      @ObjectType()
      class Bar {
        // entity fields passed into constructor
        constructor(private message: string) { }
        @FieldMethod()
        messageLength(@ArgumentParameter({ name: 'multiply' }) multiply: number): number {
          return this.getLength(this.message) * multiply;
        }
        // sample helper method
        private getLength(str: string): number {
          return str.length;
        }
      }
      @ObjectType()
      class Query {
        @FieldMethod()
        bar(): Bar {
          return new Bar('BAR');
        }
      }
      const result = await graphql(new GraphQLSchema({
        query: getObjectTypeFromClass(Query) as GraphQLObjectType,
      }), `{ bar { messageLength(multiply: 2) } }`);
      expect(result.errors).toBeFalsy();
      expect(result.data.bar.messageLength).toBe(6);
    });
  });
  describe('Input Object Type', async () => {
    it('should build input object type using InputObjectType decorator', async () => {
      @InputObjectType()
      class Foo { }
      expect(stripWhitespaces(printType(getInputTypeFromClass(Foo) as any))).toBe(stripWhitespaces(`
        input Foo {

        }
      `));
    });
    it('should build input object type with scalar fields using InputFieldProperty decorator', async () => {
      @InputObjectType()
      class Foo {
        @InputFieldProperty()
        bar: string;
      }
      expect(stripWhitespaces(printType(getInputTypeFromClass(Foo) as any))).toBe(stripWhitespaces(`
        input Foo {
          bar: String
        }
      `));
    });
    it('should be used as an argument type', async () => {
      @InputObjectType()
      class Foo {
        @InputFieldProperty()
        message: string;
      }
      @ObjectType()
      class Query {
        @FieldMethod()
        fooMessage(@ArgumentParameter({ name: 'foo' }) foo: Foo): string {
          return foo.message;
        }
      }
      const result = await graphql(new GraphQLSchema({
        query: getObjectTypeFromClass(Query) as GraphQLObjectType,
      }), `{ fooMessage(foo: { message: "FOO" }) }`);
      expect(result.errors).toBeFalsy();
      expect(result.data.fooMessage).toBe('FOO');
    });
    it('should work together with ObjectType', async () => {
      @InputObjectType({ name: 'FooInput' })
      @ObjectType()
      class Foo {
        @FieldProperty()
        @InputFieldProperty()
        message: string;
      }

      @ObjectType()
      class Query {
        @FieldMethod()
        foo(@ArgumentParameter({ name: 'foo' }) foo: Foo): Foo {
          return foo;
        }
      }
      const result = await graphql(new GraphQLSchema({
        query: getObjectTypeFromClass(Query) as GraphQLObjectType,
      }), `{ foo(foo: { message: "FOO" }) { message } }`);
      expect(result.errors).toBeFalsy();
      expect(result.data.foo.message).toBe('FOO');
    });
  });
  describe('Interface Type', async () => {
    it('should build interface type using InterfaceType decorator', async () => {
      @InterfaceType()
      class Foo { }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Foo)))).toBe(stripWhitespaces(`
        interface Foo {

        }
      `));
    });
    it('should build interface type with scalar fields using FieldProperty decorator', async () => {
      @InterfaceType()
      class Foo {
        @FieldProperty()
        bar: string;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Foo)))).toBe(stripWhitespaces(`
        interface Foo {
          bar: String
        }
      `));
    });
    it('should implements other types', async () => {
      @InterfaceType()
      class Foo {
        @FieldProperty()
        foo: string;
      }
      @ObjectType({
        interfaces: [getObjectTypeFromClass(Foo) as any],
      })
      class Bar implements Foo {
        @FieldProperty()
        foo: string;
        @FieldProperty()
        bar: string;
        @FieldProperty()
        qux: string;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Bar)))).toBe(stripWhitespaces(`
        type Bar implements Foo {
          foo: String
          bar: String
          qux: String
        }
      `));
    });
  });
  describe('Scalar Type', async () => {
    it('should build scalar type using ScalarType decorator', async () => {
      @ScalarType()
      class Foo {}
      expect(stripWhitespaces(printType(getScalarTypeFromClass(Foo as any)))).toBe(stripWhitespaces(`
        scalar Foo
      `));
    });
    it('should build object type with scalar field', async () => {
      @ScalarType()
      class Foo {}
      @ObjectType()
      class Query {
        @FieldProperty({ type: Foo as any })
        foo: Foo;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Query)))).toBe(stripWhitespaces(`
        type Query {
          foo: Foo
        }
      `));
    });
    it('should build input object type with scalar field', async () => {
      @ScalarType()
      class Foo {}
      @InputObjectType()
      class Bar {
        @InputFieldProperty({ type: Foo as any })
        foo: Foo;
      }
      expect(stripWhitespaces(printType(getInputTypeFromClass(Bar) as any))).toBe(stripWhitespaces(`
        input Bar {
          foo: Foo
        }
      `));
    });
  });
  describe('EnumType', async () => {
    it('should build enum type using EnumType decorator', async () => {
      enum Foo { a = 'a', b = 'b' }
      EnumType({ name: 'Foo' })(Foo);
      expect(stripWhitespaces(printType(getScalarTypeFromClass(Foo as any)))).toBe(stripWhitespaces(`
        enum Foo {
          a
          b
        }
      `));
    });
    it('should build object type with enum field', async () => {
      enum Foo { a = 'a', b = 'b' }
      EnumType({ name: 'Foo' })(Foo);
      @ObjectType()
      class Query {
        @FieldProperty({ type: Foo }) // Enums cannot be reflected, so we should define them explicitly
        foo: Foo;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Query)))).toBe(stripWhitespaces(`
        type Query {
          foo: Foo
        }
      `));
    });
    it('should build input object type with enum field', async () => {
      enum Foo { a = 'a', b = 'b' }
      EnumType({ name: 'Foo' })(Foo);
      @InputObjectType()
      class Bar {
        @InputFieldProperty({ type: Foo }) // Enums cannot be reflected, so we should define them explicitly
        foo: Foo;
      }
      expect(stripWhitespaces(printType(getInputTypeFromClass(Bar) as any))).toBe(stripWhitespaces(`
        input Bar {
          foo: Foo
        }
      `));
    });
  });
  describe('Union types', async () => {
    it('should build union type using UnionType decorator', async () => {
      const Foo = UnionType({ name: 'Foo', types: [String, Number], resolveType: () => String })({});
      type Foo = string | number;
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Foo as any)))).toBe(stripWhitespaces(`
        union Foo = String | Float
      `));
    });
    it('should build object type with union field', async () => {
      const Foo = UnionType({ name: 'Foo', types: [String, Number], resolveType: () => String })({});
      type Foo = string | number;
      @ObjectType()
      class Query {
        @FieldProperty({ type: Foo }) // Unions cannot be reflected, so we should define them explicitly
        foo: Foo;
      }
      expect(stripWhitespaces(printType(getObjectTypeFromClass(Query)))).toBe(stripWhitespaces(`
        type Query {
          foo: Foo
        }
      `));
    });
  });
});
