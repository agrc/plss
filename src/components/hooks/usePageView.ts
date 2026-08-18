import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';
import { useEffect } from 'react';

type EventData = Record<string, unknown>;
type AnalyticsCompatibilityToken = null;

export default function usePageView(page: string, data?: EventData) {
  const firebaseLogEvent = useFirebaseAnalytics();

  useEffect(() => {
    firebaseLogEvent(page, data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // we only want this to run on load

  const logEvent = (_analytics: AnalyticsCompatibilityToken, event: string, eventData?: EventData) =>
    firebaseLogEvent(event, eventData);

  return { analytics: null, logEvent } as const;
}
