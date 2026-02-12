import { useMachine } from '@xstate/react';
import { createContext } from 'react';
import { submissionMachine } from '../machines';

export const SubmissionContext = createContext({});

/**
 * @typedef {Object} SubmissionProviderProps
 * @property {React.ReactNode} children
 * @property {Object} [context]
 */

/**
 * @type {React.FC<SubmissionProviderProps>}
 */
export const SubmissionProvider = ({ children, context }) => {
  const [state, send] = useMachine(submissionMachine, {
    input: { ...context },
  });

  return <SubmissionContext.Provider value={[state, send]}>{children}</SubmissionContext.Provider>;
};
