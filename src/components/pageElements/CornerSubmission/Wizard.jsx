import { Button } from '../../formElements/Buttons.jsx';
import PropTypes from 'prop-types';

export default function Wizard({ back, next, finish, clear }) {
  return (
    <div className="mt-6 flex justify-center">
      {back && (
        <Button style="secondary" buttonGroup={{ left: true }} onClick={back}>
          Back
        </Button>
      )}
      {clear && (
        <Button
          style="alternate"
          buttonGroup={{
            middle: back && (next || finish),
            left: !back,
          }}
          onClick={clear}
        >
          Clear
        </Button>
      )}
      {next && (
        <Button buttonGroup={{ right: true }} type="submit">
          Next
        </Button>
      )}
      {finish && (
        <Button buttonGroup={{ right: true }} type="submit" onClick={finish}>
          Submit
        </Button>
      )}
    </div>
  );
}

Wizard.propTypes = {
  back: PropTypes.func,
  next: PropTypes.bool,
  finish: PropTypes.func,
  clear: PropTypes.func,
};

Wizard.defaultProps = {
  back: false,
  next: false,
};
