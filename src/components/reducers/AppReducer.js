const toggleDrawer = (draft, action) => {
  // same component is visible -> toggle it
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

  return draft;
};

export const defaults = {
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
  },
  submission: {},
};

const reduce = (draft, action) => {
  if (!action) {
    console.error(
      `dispatch event is empty

expected

{type: 'action', payload: 'data', meta: 'extra data'}`
    );
    return;
  }

  const keys = Object.keys(action);
  if (keys.length < 1) {
    console.error(
      `incorrect dispatch shape sent

${action}

expected

{type: 'action', payload: 'data', meta: 'extra data'}`
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
      draft.map.activeTool === null;
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
    case 'menu/toggle': {
      draft = toggleDrawer(draft, action);

      if (action.payload === 'submission') {
        draft.submission = action.meta;
      }

      if (action.payload === '' && draft.map.graphic) {
        draft.map.graphic = null;
      }

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
    default:
      console.error(`missing case ${action.type}`);
      return;
  }
};

export default reduce;
