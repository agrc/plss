import PropTypes from 'prop-types';
import { Button, Link } from '../formElements/Buttons.jsx';
import usePageView from '../hooks/usePageView.jsx';

export default function Welcome({ dispatch }) {
  usePageView('screen-home');

  return (
    <main className="mt-3 inline-grid gap-4">
      <h2 className="text-2xl font-semibold">What is the PLSS</h2>
      <p className="ml-3">
        Section corners in the Public Land Survey System (PLSS) form the foundation for all descriptions of private
        property and public land boundaries in Utah. All legal property descriptions start from PLSS section corner
        markers, also known as monuments. Keeping the correct, precise location of these monuments accessible greatly
        reduces boundary discrepancies and disputes.
      </p>
      <h2 className="text-2xl font-semibold">What is a monument</h2>
      <p className="ml-3">
        Monuments are physical objects that mark the corners of the PLSS sections. The monuments are usually metal rods
        or brass disks in the ground. Each year hundreds of section corners that are used to determine property
        locations are in danger of being destroyed from land disturbances like new road projects, property development,
        and even conservation projects that rehabilitate vegetation after wild land and forest fires.
      </p>
      <h2 className="text-2xl font-semibold">Getting started</h2>
      <p className="ml-3">
        You can use this website to view the location of the monuments and the information about them. Navigate around
        the map and click on the PLSS points to see more information or to submit a monument record for that location.
        You will need to{' '}
        <Button onClick={() => dispatch({ type: 'menu/toggle', payload: 'login' })} style="link">
          log in
        </Button>{' '}
        to submit a monument record.
      </p>
      <p className="ml-3"></p>
      <h2 className="text-2xl font-semibold">Where can I get the data</h2>
      <p className="ml-3">
        All of the data in this app and more is made available for{' '}
        <Link href="https://gis.utah.gov/products/sgid/cadastre/" target="_blank" rel="noreferrer">
          download
        </Link>{' '}
        on the{' '}
        <Link href="https://gis.utah.gov/" target="_blank" rel="noreferrer">
          UGRC website
        </Link>
        .
      </p>
    </main>
  );
}
Welcome.propTypes = {
  dispatch: PropTypes.func,
};
