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
const reduce = (draft, action) => {
  console.log(`reducing ${action.type}`);

  switch (action.type) {
    case 'user/login': {
      draft.authenticated = true;
      break;
    }
    case 'menu/click': {
      draft = toggleDrawer(draft, action);

      break;
    }
    case 'map-layers/click': {
      const index = draft.activeLayers.indexOf(action.payload);

      if (index > -1) {
        draft.activeLayers.splice(index, 1);
      } else {
        draft.activeLayers.push(action.payload);
      }

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
