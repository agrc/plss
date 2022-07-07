const toggleDrawer = (draft, action) => {
  // same component is visible -> toggle it
  if (draft.trayItem === action.payload) {
    draft.drawerOpen = !draft.drawerOpen;
    draft.trayItem = null;
  } else {
    draft.drawerOpen = true;
    draft.trayItem = action.payload;
  }

  return draft;
};

export const defaults = {
  trayItem: null,
  activeLayers: ['Parcels'],
  addPoint: {
    color: { hex: '' },
    geometry: {},
  },
  userPoints: '',
  map: {
    activeTool: null,
  },
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
      draft = toggleDrawer(draft, action);
      draft.graphic = action.payload;

      break;
    }
    default:
      console.error(`missing case ${action.type}`);
      return;
  }
};

export default reduce;
