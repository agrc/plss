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
    color: { hex: '' },
    geometry: {},
  },
  userPoints: [],
  map: {
    activeTool: null,
  },
  submission: {},
};

const reduce = (draft, action) => {
  console.log(`reducing ${action.type}`);

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
        color: { hex: '' },
        geometry: null,
      };
      break;
    }
    case 'map/userPoints': {
      draft.userPoints = action.payload;
      break;
    }
    case 'map/identify': {
      draft.graphic = action.payload;

      break;
    }
    case 'menu/toggle': {
      draft = toggleDrawer(draft, action);

      if (action.payload === 'submission') {
        draft.submission = action.meta;
      }
      break;
    }
    default:
      console.error(`missing case ${action.type}`);
      return;
  }
};

export default reduce;
