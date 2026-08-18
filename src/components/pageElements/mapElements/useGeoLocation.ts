import { useMachine } from '@xstate/react';
import { machine as geolocationMachine } from '../../machines/geolocation.ts';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';

type GeolocationMachine = typeof geolocationMachine;

type UseGeolocationResult = [SnapshotFrom<GeolocationMachine>, ActorRefFrom<GeolocationMachine>['send']];

export default function useGeolocation(): UseGeolocationResult {
  const [state, send] = useMachine(geolocationMachine);

  return [state, send];
}
