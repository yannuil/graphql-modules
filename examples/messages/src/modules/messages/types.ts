import { User } from '../../3rd-party/users';

export interface Message {
  id: number;
  sender: User;
  content: string;
  createdAt: Date;
  recipient: User;
}

export interface MessageDbObject {
  id: number;
  sender: number;
  content: string;
  createdAt: Date;
  recipient: number;
}
