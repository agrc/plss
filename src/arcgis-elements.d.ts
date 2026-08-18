import type EsriMap from '@arcgis/core/Map';
import type MapView from '@arcgis/core/views/MapView';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  interface ArcgisMapElement extends HTMLElement {
    extent: {
      spatialReference: { wkid: number };
      type: 'extent';
      xmax: number;
      xmin: number;
      ymax: number;
      ymin: number;
    };
    map: EsriMap;
    view: MapView;
    viewOnReady: () => Promise<void>;
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'arcgis-map': DetailedHTMLProps<HTMLAttributes<ArcgisMapElement>, ArcgisMapElement>;
      'arcgis-expand': Record<string, unknown>;
      'calcite-checkbox': Record<string, unknown>;
      'calcite-label': Record<string, unknown>;
      'calcite-radio-button': Record<string, unknown>;
      'calcite-radio-button-group': Record<string, unknown>;
    }
  }
}

export {};
