import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import { useEffect } from 'react';

export default function usePageView(page, data) {
  const logEvent = useFirebaseAnalytics();

  useEffect(() => {
    logEvent(page, data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // we only want this to run on load

  return { logEvent };
}
