import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import PropTypes from 'prop-types';

import { Button } from '../formElements/Buttons.jsx';

export default function DefaultFallback({ error, resetErrorBoundary }) {
  const logEvent = useFirebaseAnalytics();

  logEvent('error-boundary', {
    error: error.message,
  });

  return (
    <div role="alert" data-area="drawer">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="rounded-sm border p-4">{error.message}</p>
      <div className="mt-4 flex justify-center">
        <Button onClick={() => resetErrorBoundary()}>Reset</Button>
      </div>
    </div>
  );
}
DefaultFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};
