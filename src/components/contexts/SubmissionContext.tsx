import { useMachine } from '@xstate/react';
import { createContext, type ReactNode, useContext } from 'react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';
import { submissionMachine, type SubmissionMachineContext } from '../machines/index.js';

export type SubmissionContextValue = [
  SnapshotFrom<typeof submissionMachine>,
  ActorRefFrom<typeof submissionMachine>['send'],
];

export const SubmissionContext = createContext<SubmissionContextValue | undefined>(undefined);

export const useSubmissionContext = (): SubmissionContextValue => {
  const value = useContext(SubmissionContext);

  if (!value) {
    throw new Error('useSubmissionContext must be used within a SubmissionProvider');
  }

  return value;
};

type SubmissionProviderProps = {
  children: ReactNode;
  context?: SubmissionMachineContext;
};

export const SubmissionProvider = ({ children, context = {} }: SubmissionProviderProps) => {
  const [state, send] = useMachine(submissionMachine, {
    input: { ...context },
  });

  return <SubmissionContext.Provider value={[state, send]}>{children}</SubmissionContext.Provider>;
};
