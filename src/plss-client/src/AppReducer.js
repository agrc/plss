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
  authenticated: false,
  activeLayers: ['Parcels'],
  addPoint: {
    color: { hex: '#fff' },
    point: null,
    notes: '',
  },
  map: {
    activeTool: null,
  },
};

const reduce = (draft, action) => {
  console.log(`reducing ${action.type}`);

  switch (action.type) {
    case 'map-layers/click': {
      const index = draft.activeLayers.indexOf(action.payload);

      if (index > -1) {
        draft.activeLayers.splice(index, 1);
      } else {
        draft.activeLayers.push(action.payload);
      }

      break;
    }
    case 'add-point/color': {
      draft.addPoint.color = action.payload;
      break;
    }
    case 'add-point/click': {
      draft.addPoint.point = action.payload;
      break;
    }
    case 'add-point/notes': {
      draft.addPoint.notes = action.payload;
      break;
    }
    case 'add-point/activate': {
      draft.map.activeTool = draft.map.activeTool !== 'add-point' ? 'add-point' : null;
      if (draft.map.activeTool === null) {
        draft.addPoint.point = null;
      }

      break;
    }
    case 'user/login': {
      draft.authenticated = true;
      break;
    }
    case 'map/identify': {
      draft = toggleDrawer(draft, action);
      draft.graphic = action.payload;

      break;
    }
    default:
      return;
  }
};

export default reduce;
