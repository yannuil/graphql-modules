import { GraphQLModule } from '@graphql-modules/core';
import { subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { EventEmitter } from 'events';

const pubsub = new PubSub();
const ee = new EventEmitter();

export const eventModule = new GraphQLModule({
  typeDefs: gql`
    type Query {
      foo: String
    }
    type Subscription {
      eventEmittedInside: String!
      eventEmittedOutside: String!
    }
  `,

  resolvers: {
    Subscription: {
      eventEmittedInside: {
        subscribe: () => {
          const iterator = pubsub.asyncIterator('EVENT_MODULE_INSIDE');

          ee.on('publish from inside', data => {
            // tslint:disable-next-line: no-console
            console.log('client received message:', data);
            pubsub.publish('EVENT_MODULE_INSIDE', data);
          });

          setTimeout(function publishPubsubModulePayload() {
            ee.emit('publish from inside', 'Hi from EVENT_MODULE inside');
          }, 0);

          return iterator;
        },

        resolve(payload) {
          // tslint:disable-next-line: no-console
          console.log('resolve [inside] -> payload', payload);
          return payload;
        }
      },

      eventEmittedOutside: {
        subscribe: () => {
          const iterator = pubsub.asyncIterator('EVENT_MODULE_OUTSIDE');

          ee.on('publish from outside', data => {
            // tslint:disable-next-line: no-console
            console.log('client received message:', data);

            pubsub.publish('EVENT_MODULE_OUTSIDE', data);
          });
          return iterator;
        },

        resolve(payload) {
          // have not been called when emitted outside unless uncommented asyncIterator.next() call
          // tslint:disable-next-line: no-console
          console.log('resolve [outside] -> payload', payload);
          return payload;
        }
      }
    }
  }
});

describe('client receives payload', () => {
  const { schema } = eventModule;

  it('client receives payload from inside', async () => {
    const asyncIterator: any = await subscribe({
      schema,
      document: gql`
        subscription {
          eventEmittedInside
        }
      `
    });

    if (asyncIterator.errors) {
      // tslint:disable-next-line: no-console
      console.info('Not iterator! Execution result: %O', asyncIterator);
    }

    const iteratorResult = await asyncIterator.next();
    const { data } = iteratorResult.value;

    expect(data.eventEmittedInside).toEqual('Hi from EVENT_MODULE inside');
  });

  it('client receives payload from outside', async () => {
    const asyncIterator: any = await subscribe({
      schema,
      document: gql`
        subscription {
          eventEmittedOutside
        }
      `
    });

    // ---------------------------------------------------------
    // asyncIterator.next() // <-- why it is needed?
    // ---------------------------------------------------------
    setTimeout(async () => {
      ee.emit('publish from outside', 'Hi from EVENT_MODULE outside');
    }, 0);

    if (asyncIterator.errors) {
      // tslint:disable-next-line: no-console
      console.info('Not iterator! Execution result: %O', asyncIterator);
    }

    const iteratorResult = await asyncIterator.next();
    const { data } = iteratorResult.value;

    expect(data.eventEmittedOutside).toEqual('Hi from EVENT_MODULE outside');
  });
});
