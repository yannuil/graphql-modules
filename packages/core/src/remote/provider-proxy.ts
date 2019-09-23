import { Fetcher } from './types';

export function getClassProviderProxy<T = any>(fetcher: Fetcher, providerName: string, secret: string): T {
  const fakeFunction = function() {};
  Object.defineProperty(fakeFunction, 'name', {
    value: providerName
  });
  return new Proxy<any>(fakeFunction, {
    construct(_, __) {
      return new Proxy<any>({} as any, {
        get(_, methodName: string) {
          return async (...args: any[]) => {
            const {
              data: {
                _graphqlModule: { callProvider: returnData }
              }
            } = await fetcher(
              /* GraphQL */ `
                query ProviderNameMethodName($providerName: String, $methodName: String, $args: JSON, $secret: String) {
                  _graphqlModule(secret: $secret) {
                    callProvider(providerName: $providerName, methodName: $methodName, args: $args)
                  }
                }
              `,
              { providerName, methodName, args: JSON.stringify(args), secret }
            );
            return JSON.parse(returnData);
          };
        }
      });
    },
    get(_, property: string) {
      switch (property) {
        case 'name':
          return providerName;
        case 'prototype':
          // FIXME: Needs to be fixed for hooks
          return fakeFunction.prototype;
      }
      return undefined;
    },
    has(_, property: string) {
      switch (property) {
        case 'name':
        case 'prototype':
          return true;
      }
      return false;
    }
  });
}
