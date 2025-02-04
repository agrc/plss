import { logEvent } from 'firebase/analytics';
import { useEffect } from 'react';
import { useAnalytics } from 'reactfire';

export default function usePageView(page, data) {
  const analytics = useAnalytics();

  useEffect(() => {
    logEvent(analytics, page, data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // we only want this to run on load

  return { analytics, logEvent };
}
