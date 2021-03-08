import { Button } from '../FormElements';

const Wizard = ({ back, next, finish, clear }) => (
  <div className="flex justify-center mt-6">
    {back && <Button label="Back" secondary={true} buttonGroup={{ left: true }} onClick={back} />}
    {clear && <Button label="Clear" dark={true} buttonGroup={{ left: !back }} onClick={clear} />}
    {next && <Button label="Next" primary={true} buttonGroup={{ right: true }} type="submit" />}
    {finish && <Button label="Submit" primary={true} buttonGroup={{ right: true }} type="submit" onClick={finish} />}
  </div>
);

export default Wizard;
