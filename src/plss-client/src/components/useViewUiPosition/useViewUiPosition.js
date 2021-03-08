import PropTypes from 'prop-types';
import * as React from 'react';

export default function useViewUiPosition(view, position) {
  const me = React.useRef();

  React.useEffect(() => {
    // view?.ui?.add(me.current, position);
  }, [position, view]);

  return me;
}

useViewUiPosition.propTypes = {
  view: PropTypes.shape({
    ui: PropTypes.shape({
      add: PropTypes.func.isRequired,
    }),
  }),
  position: PropTypes.oneOf([
    'bottom-leading',
    'bottom-left',
    'bottom-right',
    'bottom-trailing',
    'top-leading',
    'top-left',
    'top-right',
    'top-trailing',
    'manual',
  ]),
};
