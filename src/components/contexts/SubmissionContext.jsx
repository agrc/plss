import { createContext } from 'react';
import PropTypes from 'prop-types';
import { useMachine } from '@xstate/react';
import { submissionMachine } from '../machines';

export const SubmissionContext = createContext({});

export const SubmissionProvider = ({ children, context }) => {
  const [state, send] = useMachine(submissionMachine, {
    context,
  });

  return (
    <SubmissionContext.Provider value={[state, send]}>
      {children}
    </SubmissionContext.Provider>
  );
};

SubmissionProvider.propTypes = {
  children: PropTypes.node.isRequired,
  context: PropTypes.object,
};
