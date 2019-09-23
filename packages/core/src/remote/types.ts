import { ExecutionResult } from 'graphql';

export type Fetcher = (operation: string, variables?: any) => Promise<ExecutionResult>;
