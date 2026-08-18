import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';
import type { FallbackProps } from 'react-error-boundary';

import { Button } from '../formElements/Buttons.tsx';

export default function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  const logEvent = useFirebaseAnalytics();
  const message = error instanceof Error ? error.message : String(error);

  logEvent('error-boundary', {
    error: message,
  });

  return (
    <div role="alert" data-area="drawer">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="rounded-sm border p-4">{message}</p>
      <div className="mt-4 flex justify-center">
        <Button onClick={() => resetErrorBoundary()}>Reset</Button>
      </div>
    </div>
  );
}
