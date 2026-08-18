import type { Draft } from 'immer';

export type AppState = {
  activeComponent: string | null;
  drawerOpen: boolean;
  activeLayers: string[];
  addPoint: {
    color: string;
    geometry: unknown;
  };
  userPoints: unknown[];
  map: {
    activeTool: 'add-point' | null;
    graphic: unknown;
    gps: { graphic: unknown; scale?: number } | null;
    center: { geometry: unknown; scale: number } | null;
  };
  submission: unknown;
};

export type AppAction =
  | { type: 'add-point/color'; payload: string }
  | { type: 'add-point/click'; payload: unknown }
  | { type: 'add-point/activate' }
  | { type: 'add-point/reset' }
  | { type: 'map/userPoints'; payload: unknown[] }
  | { type: 'map/identify'; payload: unknown }
  | { type: 'map/set-gps-location'; payload: unknown }
  | { type: 'map/update-gps-location'; payload: unknown }
  | { type: 'map/center-and-zoom'; payload: unknown; meta?: { scale?: number } }
  | { type: 'menu/toggle'; payload: string; meta?: unknown };

type MenuToggleAction = Extract<AppAction, { type: 'menu/toggle' }>;

const toggleDrawer = (
  draft: Draft<AppState>,
  action: MenuToggleAction,
): void => {
  if (action.payload === '') {
    draft.drawerOpen = false;
    draft.activeComponent = action.payload;
  } else if (
    draft.activeComponent === action.payload &&
    action.payload !== 'identify'
  ) {
    draft.drawerOpen = !draft.drawerOpen;
    draft.activeComponent = null;
  } else {
    draft.drawerOpen = true;
    draft.activeComponent = action.payload;
  }
};

export const defaults: AppState = {
  activeComponent: 'welcome',
  drawerOpen: true,
  activeLayers: ['Parcels'],
  addPoint: {
    color: '',
    geometry: {},
  },
  userPoints: [],
  map: {
    activeTool: null,
    graphic: null,
    gps: null,
    center: null,
  },
  submission: {},
};

const reduce = (
  draft: Draft<AppState>,
  action: AppAction | undefined,
): void => {
  if (!action) {
    console.error(
      `dispatch event is empty

expected

{type: 'action', payload: 'data', meta: 'extra data'}`,
    );
    return;
  }

  switch (action.type) {
    case 'add-point/color': {
      draft.addPoint.color = action.payload;
      break;
    }
    case 'add-point/click': {
      draft.addPoint.geometry = action.payload;
      break;
    }
    case 'add-point/activate': {
      draft.map.activeTool =
        draft.map.activeTool !== 'add-point' ? 'add-point' : null;
      if (draft.map.activeTool === null) {
        draft.addPoint.geometry = null;
      }

      break;
    }
    case 'add-point/reset': {
      draft.map.activeTool = null;
      draft.addPoint = {
        color: '',
        geometry: null,
      };
      break;
    }
    case 'map/userPoints': {
      draft.userPoints = action.payload;
      break;
    }
    case 'map/identify': {
      draft.map.graphic = action.payload;
      break;
    }
    case 'map/set-gps-location': {
      draft.map.gps = {
        graphic: action.payload,
        scale: 4500,
      };
      break;
    }
    case 'map/update-gps-location': {
      draft.map.gps = {
        graphic: action.payload,
      };
      break;
    }
    case 'map/center-and-zoom': {
      draft.map.center = {
        geometry: action.payload,
        scale: action.meta?.scale ?? 4500,
      };
      break;
    }
    case 'menu/toggle': {
      toggleDrawer(draft, action);

      if (action.payload === 'submission') {
        draft.submission = action.meta;
      }

      if (action.payload === '' && draft.map.graphic) {
        draft.map.graphic = null;
      }

      break;
    }
    default: {
      const exhaustive: never = action;
      console.error('missing case', exhaustive);
    }
  }
};

export default reduce;