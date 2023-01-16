import { useAnalytics } from 'reactfire';
import { logEvent } from 'firebase/analytics';
import { useEffect } from 'react';

export default function usePageView(page, data) {
  const analytics = useAnalytics();

  useEffect(() => {
    logEvent(analytics, 'page-view', { page, ...data });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // we only want this to run on load

  return { analytics, logEvent };
}
