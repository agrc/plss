import type { SubmissionStatus } from '@ugrc/plss-shared';
import type { Dispatch } from 'react';
import type { AppAction } from '../reducers/AppReducer.ts';

export type AppDispatch = Dispatch<AppAction | undefined>;

export type PointGeometry = {
  spatialReference: {
    wkid: 3857 | 4326;
  };
  type: 'point';
  x: number;
  y: number;
};

export type SubmissionItem = {
  attributes: {
    id: string;
    ref?: string;
    status: string;
    when: string;
  };
  geometry?: PointGeometry;
  id: string;
  key: string;
  label: string;
  status: SubmissionStatus;
  submitted: string;
};

export type ReferencePointItem = {
  attributes: {
    id: string;
    name: string;
    notes: string;
    when: string;
  };
  geometry: PointGeometry;
  key: string;
  photos: string[];
};

export type MyContentData = {
  points: ReferencePointItem[];
  submissions: SubmissionItem[];
};
