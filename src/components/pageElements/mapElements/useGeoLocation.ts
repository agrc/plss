import { useMachine } from '@xstate/react';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';
import { machine as geolocationMachine } from '../../machines/geolocation.ts';

type GeolocationMachine = typeof geolocationMachine;

type UseGeolocationResult = [SnapshotFrom<GeolocationMachine>, ActorRefFrom<GeolocationMachine>['send']];

export default function useGeolocation(): UseGeolocationResult {
  const [state, send] = useMachine(geolocationMachine);

  return [state, send];
}
