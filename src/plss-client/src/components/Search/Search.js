import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useViewUiPosition from '../useViewUiPosition';

const Search = ({ view }) => {
  const me = useViewUiPosition(view, 'top-left');

  return (
    <div
      ref={me}
      className="esri-home esri-widget--button esri-widget"
      role="button"
      aria-label="Search"
      title="Search"
    >
      <FontAwesomeIcon icon={faSearch} className="esri-icon esri-icon-home" />
    </div>
  );
};

export default Search;
