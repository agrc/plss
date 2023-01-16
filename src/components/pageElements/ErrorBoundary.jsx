import PropTypes from 'prop-types';
import { Button } from '../formElements/Buttons.jsx';

export default function DefaultFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" data-area="drawer">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="rounded border p-4">{error.message}</p>
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
