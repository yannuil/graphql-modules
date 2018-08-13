import { MessageDbObject } from './types';

const data: MessageDbObject[] = [
  {
    id: 1,
    sender: 1,
    content: 'Hi',
    createdAt: new Date(),
    recipient: 2,
  },
  {
    id: 1,
    sender: 2,
    content: 'Hello!',
    createdAt: new Date(),
    recipient: 1,
  },
];

export default data;
