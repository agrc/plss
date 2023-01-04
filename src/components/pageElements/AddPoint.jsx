import { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { contrastColor } from 'contrast-color';
import { CirclePicker } from 'react-color';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useUser, useFunctions } from 'reactfire';
import { httpsCallable } from 'firebase/functions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LimitedTextarea } from '../formElements/LimitedTextarea.jsx';
import { Input } from '../formElements/Inputs.jsx';
import { Switch } from '../formElements/Switch.jsx';
import Spacer from '../formElements/Spacer.jsx';
import { NumberedForm, NumberedFormSection } from '../formElements/Form.jsx';
import Card from '../formElements/Card.jsx';
import { addPointSchema as schema } from './CornerSubmission/Schema.mjs';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ErrorMessageTag from './ErrorMessage.jsx';
import Wizard from './CornerSubmission/Wizard.jsx';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import FileUpload from '../formElements/FileUpload.jsx';
import { Button } from '../formElements/Buttons.jsx';

const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const limit = 3;

export default function AddPoint({
  active,
  color,
  geometry,
  dispatch,
  notes = '',
}) {
  const functions = useFunctions();
  const addPoint = httpsCallable(functions, 'functions-httpsPostPoint');
  const { data: user } = useUser();
  const [imageCount, setImageCount] = useState(1);
  const uniqueId = useRef(crypto.randomUUID());
  const scrollContainer = useRef();

  const defaultValues = {
    name: `Point (${dateFormatter.format(new Date())})`,
    notes: '',
    color: '',
    location: '',
    [`photo-1-${uniqueId.current}`]: '',
    [`photo-2-${uniqueId.current}`]: '',
    [`photo-3-${uniqueId.current}`]: '',
  };

  const { control, formState, handleSubmit, register, reset, setValue, watch } =
    useForm({
      resolver: yupResolver(schema),
      defaultValues,
    });

  const fields = useWatch({ control });

  const selectedColor = watch('color');
  register('location', '');

  useEffect(() => {
    if (geometry?.x && geometry?.y) {
      setValue(
        'location',
        { x: geometry.x, y: geometry.y },
        { shouldValidate: true }
      );
    }
  }, [geometry, setValue]);

  const pointStyle = {
    color: contrastColor.call(
      {},
      {
        bgColor: color,
        fgLightColor: '#F3F4F6',
        fgDarkColor: '#4B5563',
      }
    ),
    border: `6px solid ${contrastColor.call(
      {},
      {
        bgColor: color,
        fgLightColor: '#F3F4F6',
        fgDarkColor: '#4B5563',
      }
    )}`,
    backgroundColor: color,
  };

  const queryClient = useQueryClient();

  const {
    mutate,
    status,
    reset: mutateReset,
  } = useMutation({
    mutationFn: (data) => addPoint(data),
    onSuccess: (response) => {
      scrollContainer.current?.scrollTo(0, 0);
      console.log('success', response);
      uniqueId.current = crypto.randomUUID();

      dispatch({ type: 'add-point/reset' });
      if (active) {
        dispatch({ type: 'add-point/activate' });
      }

      queryClient.invalidateQueries({ queryKey: ['my content'] });
      setTimeout(() => mutateReset(), 3000);

      reset(defaultValues);
    },
  });

  const onReset = () => {
    reset(defaultValues);

    if (active) {
      dispatch({ type: 'add-point/activate' });
    }

    dispatch({ type: 'add-point/reset' });
  };

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <>
      <h2 ref={scrollContainer} className="text-2xl font-bold">
        Add Reference Point
      </h2>
      <p className="mb-4 text-sm leading-tight">
        Use reference points to help you remember points of interest or other
        identifying features when out in the field collecting information.
      </p>
      <NumberedForm onSubmit={handleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Name the point">
          <div>
            <Input
              label="Name"
              placeholder="Point Name"
              type="text"
              required={true}
              {...register('name')}
            />
            <ErrorMessage
              errors={formState.errors}
              name="name"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Add notes">
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <LimitedTextarea
                value={notes}
                placeholder="these will help you remember why you are creating this point..."
                rows="5"
                maxLength={450}
                field={field}
                className="w-full text-xs"
                errors={formState.errors}
              />
            )}
          />
          <ErrorMessage
            errors={formState.errors}
            name="notes"
            as={ErrorMessageTag}
          />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Add photos">
          {new Array(imageCount).fill().map((_, i) => (
            <Fragment key={`photo-${i + 1}-${uniqueId.current}`}>
              <Controller
                name={`photo-${i + 1}-${uniqueId.current}`}
                control={control}
                render={({ field: { onChange, name } }) => (
                  <FileUpload
                    defaultFileName={name}
                    path={`submitters/${user.uid}/reference`}
                    contentTypes={[
                      { name: 'PNG', value: 'image/png' },
                      { name: 'JPEG', value: 'image/jpeg' },
                    ]}
                    maxFileSize={limit}
                    value={fields[name]}
                    onChange={onChange}
                  />
                )}
              />
              <ErrorMessage
                errors={formState.errors}
                name={`photo-${i + 1}-${uniqueId.current}`}
                as={ErrorMessageTag}
              />
            </Fragment>
          ))}
          {limit - imageCount} more photos are allowed
          <Button
            style="alternate"
            state={imageCount >= limit ? 'disabled' : 'idle'}
            onClick={() => {
              const nextPage = imageCount + 1;
              if (nextPage > limit) {
                return;
              }

              setImageCount(nextPage);
            }}
          >
            Add photo
          </Button>
        </NumberedFormSection>
        <NumberedFormSection number={4} title="Choose point color">
          <div>
            <Card>
              <div className="flex justify-center">
                <Controller
                  control={control}
                  name="color"
                  render={({ field: { onChange } }) => (
                    <CirclePicker
                      onChangeComplete={(event) => {
                        onChange(event.hex);
                        dispatch({
                          type: 'add-point/color',
                          payload: event.hex,
                        });
                      }}
                    />
                  )}
                />
              </div>
              {selectedColor && (
                <>
                  <div className="flex items-center text-slate-500">
                    <span className="h-px flex-1 bg-slate-200"></span>
                    <span className="mx-3 text-xs uppercase tracking-wide">
                      selected color
                    </span>
                    <span className="h-px flex-1 bg-slate-200"></span>
                  </div>
                  <div className="w-min justify-self-center rounded border border-slate-400 bg-gradient-to-br from-slate-600 via-slate-300 to-slate-50 p-2 shadow-lg">
                    <div
                      className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full text-center"
                      style={pointStyle}
                    >
                      {geometry?.x && (
                        <>
                          <div className="block text-xs">
                            {numberFormatter.format(geometry?.x || 0)}
                          </div>
                          <div className="block text-xs">
                            {numberFormatter.format(geometry?.y || 0)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
            <ErrorMessage
              errors={formState.errors}
              name="color"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={5} title="Place the point">
          <div>
            <Switch
              value={active}
              onChange={() => dispatch({ type: 'add-point/activate' })}
              yesValue="Drawing is active"
              noValue="Drawing is inactive"
            />
            <Spacer className="mt-4" />
            <Card>
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="mr-4 h-8 w-8 flex-none" />
                <p>
                  {active
                    ? 'You can now click on the map to place the point. Click again to move the point.'
                    : 'To place your point, toggle the switch to the right.'}
                </p>
              </div>
            </Card>
            <ErrorMessage
              errors={formState.errors}
              name="location"
              as={ErrorMessageTag}
            />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard
            finish={() => mutate}
            clear={onReset}
            status={status}
            back={false}
          />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}

AddPoint.propTypes = {
  active: PropTypes.bool,
  color: PropTypes.string,
  geometry: PropTypes.object,
  dispatch: PropTypes.func,
  notes: PropTypes.string,
};
