import { useMachine } from '@xstate/react';
import geolocationMachine from '../../machines/geolocation';

export default function useGeolocation() {
  const [state, send] = useMachine(geolocationMachine);

  return [state, send];
}
