import { Controller, useForm } from 'react-hook-form';
import { Select } from './Select.jsx';

export default {
  title: 'Form Elements/Select',
  component: Select,
};

const simpleOptions = ['1', '2', '3'];
const optionsWithLabel = [
  { value: '1', label: 'one' },
  { value: '2', label: 'two' },
  { value: '3', label: 'three' },
];
const optionsWithDisabledProperty = [
  { value: '1', label: 'one' },
  { value: '2', label: 'two', disabled: true },
  { value: '3', label: 'three' },
];

const Template = (args) => <Select {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  name: 'input',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  placeholder: 'this is a place holder',
  name: 'input',
  options: [],
  currentValue: null,
  onChange: () => {},
};

export const Options = Template.bind({});
Options.args = {
  placeholder: 'options as primitives',
  options: simpleOptions,
  name: 'input',
  currentValue: null,
  onChange: () => {},
};

export const LabelValue = Template.bind({});
LabelValue.args = {
  placeholder: 'options as objects',
  options: optionsWithLabel,
  name: 'input',
  currentValue: null,
  onChange: () => {},
};

export const SelectedItem = Template.bind({});
SelectedItem.args = {
  placeholder: 'place holder should not be used',
  options: optionsWithLabel,
  name: 'input',
  currentValue: optionsWithLabel[2],
  onChange: () => {},
};

export const DisabledItem = Template.bind({});
DisabledItem.args = {
  placeholder: 'two should be disabled',
  options: optionsWithDisabledProperty,
  name: 'input',
  onChange: () => {},
};

export const ResetInForm = () => {
  const defaultValues = {
    corner: '',
  };

  const { control, reset } = useForm({
    defaultValues,
  });

  return (
    <>
      <Controller
        control={control}
        name="corner"
        defaultValue=""
        render={({ field: { onChange, name, value } }) => (
          <Select
            name={name}
            label="Section Corner"
            required={true}
            options={['1', '2', '3']}
            placeholder="What is the section corner"
            currentValue={value}
            onUpdate={onChange}
          />
        )}
      />
      <button className="border bg-amber-200 p-2" onClick={() => reset(defaultValues)}>
        Reset
      </button>
    </>
  );
};
