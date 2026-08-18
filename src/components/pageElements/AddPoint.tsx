import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AddPoint as AddPointValues, addPointSchema as schema } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { contrastColor } from 'contrast-color';
import { httpsCallable } from 'firebase/functions';
import { Fragment, useEffect, useRef, useState } from 'react';
import { CirclePicker, type ColorResult } from 'react-color';
import { Controller, type Resolver, type UseFormHandleSubmit, useForm, useWatch } from 'react-hook-form';
import { Button } from '../formElements/Buttons.tsx';
import Card from '../formElements/Card.tsx';
import FileUpload from '../formElements/FileUpload.tsx';
import { NumberedForm, NumberedFormSection } from '../formElements/Form.tsx';
import { Input } from '../formElements/Inputs.tsx';
import { LimitedTextarea } from '../formElements/LimitedTextarea.tsx';
import Spacer from '../formElements/Spacer.tsx';
import { Switch } from '../formElements/Switch.tsx';
import usePageView from '../hooks/usePageView.ts';
import type { AppDispatch } from './contentTypes.ts';
import Wizard from './CornerSubmission/Wizard.tsx';
import ErrorMessageTag from './ErrorMessage.tsx';

const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const limit = 3;

type PointLocation = {
  x: number;
  y: number;
};

type PhotoField = `photo-${1 | 2 | 3}-${string}`;

type AddPointFormValues = Omit<AddPointValues, 'color' | 'location'> & {
  color: AddPointValues['color'] | '';
  location: PointLocation | '';
} & Record<PhotoField, string>;

type AddPointProps = {
  active?: boolean;
  color?: string;
  dispatch?: AppDispatch;
  geometry?: Partial<PointLocation>;
  notes?: string;
};

const createDefaultValues = (id: string): AddPointFormValues => ({
  name: `Point (${dateFormatter.format(new Date())})`,
  notes: '',
  color: '',
  location: '',
  [`photo-1-${id}`]: '',
  [`photo-2-${id}`]: '',
  [`photo-3-${id}`]: '',
});

export default function AddPoint({ active, color = '', geometry, dispatch, notes = '' }: AddPointProps) {
  const { currentUser } = useFirebaseAuth();
  const { functions } = useFirebaseFunctions();
  const addPoint = httpsCallable<AddPointFormValues, 1>(functions, 'postPoint');
  const [imageCount, setImageCount] = useState(1);
  const uniqueId = useRef<string>(crypto.randomUUID());
  const scrollContainer = useRef<HTMLHeadingElement>(null);
  usePageView('screen-reference-points');

  const defaultValues = createDefaultValues(uniqueId.current);

  const { control, formState, handleSubmit, register, reset, setValue, watch } = useForm<AddPointFormValues>({
    resolver: yupResolver(schema) as Resolver<AddPointFormValues>,
    defaultValues,
  });
  const typedHandleSubmit = handleSubmit as UseFormHandleSubmit<AddPointFormValues>;

  const fields = useWatch({ control });

  const selectedColor = watch('color');
  register('location');

  useEffect(() => {
    if (geometry?.x && geometry?.y) {
      setValue('location', { x: geometry.x, y: geometry.y }, { shouldValidate: true });
    }
  }, [geometry, setValue]);

  const pointStyle = {
    color: contrastColor.call(
      {},
      {
        bgColor: color,
        fgLightColor: '#F3F4F6',
        fgDarkColor: '#4B5563',
      },
    ),
    border: `6px solid ${contrastColor.call(
      {},
      {
        bgColor: color,
        fgLightColor: '#F3F4F6',
        fgDarkColor: '#4B5563',
      },
    )}`,
    backgroundColor: color,
  };

  const queryClient = useQueryClient();

  const {
    mutate,
    status,
    reset: mutateReset,
  } = useMutation({
    mutationFn: (data: AddPointFormValues) => addPoint(data),
    onSuccess: () => {
      scrollContainer.current?.scrollTo(0, 0);
      uniqueId.current = crypto.randomUUID();

      reset(createDefaultValues(uniqueId.current));

      if (active) {
        dispatch?.({ type: 'add-point/activate' });
      }

      dispatch?.({ type: 'add-point/reset' });

      queryClient.invalidateQueries({ queryKey: ['my content'] });
      setTimeout(() => mutateReset(), 3000);
    },
  });
  const wizardStatus = status === 'idle' ? undefined : status;

  const onReset = () => {
    reset(createDefaultValues(uniqueId.current));

    if (active) {
      dispatch?.({ type: 'add-point/activate' });
    }

    dispatch?.({ type: 'add-point/reset' });
  };

  const onSubmit = (data: AddPointFormValues) => {
    mutate(data);
  };

  return (
    <>
      <h2 ref={scrollContainer} className="text-2xl font-semibold">
        Add Reference Point
      </h2>
      <p className="text-sm leading-tight">
        Use reference points to help you remember points of interest or other identifying features when out in the field
        collecting information.
      </p>
      <Spacer className="my-4" />
      <NumberedForm onSubmit={typedHandleSubmit(onSubmit)}>
        <NumberedFormSection number={1} title="Name the point">
          <div>
            <Input label="Name" placeholder="Point Name" type="text" required={true} {...register('name')} />
            <ErrorMessage errors={formState.errors} name="name" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={2} title="Add notes">
          <label htmlFor="notes" className="sr-only">
            Notes
          </label>
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <LimitedTextarea
                value={notes}
                placeholder="these will help you remember why you are creating this point..."
                rows={5}
                maxLength={450}
                field={field}
                className="w-full text-xs"
                errors={formState.errors}
              />
            )}
          />
          <ErrorMessage errors={formState.errors} name="notes" as={ErrorMessageTag} />
        </NumberedFormSection>
        <NumberedFormSection number={3} title="Add photos">
          <label htmlFor="photos" className="sr-only">
            Add photos
          </label>
          {Array.from({ length: imageCount }, (_, i) => (
            <Fragment key={`photo-${i + 1}-${uniqueId.current}`}>
              <Controller
                name={`photo-${i + 1}-${uniqueId.current}` as PhotoField}
                control={control}
                render={({ field: { onChange, name } }) => (
                  <FileUpload
                    id={`photo-${i + 1}-${uniqueId.current}`}
                    defaultFileName={name}
                    path={`submitters/${currentUser?.uid ?? ''}/reference`}
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
                name={`photo-${i + 1}-${uniqueId.current}` as PhotoField}
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
                      onChangeComplete={(event: ColorResult) => {
                        onChange(event.hex);
                        dispatch?.({
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
                    <span className="mx-3 text-xs tracking-wide uppercase">selected color</span>
                    <span className="h-px flex-1 bg-slate-200"></span>
                  </div>
                  <div className="w-min justify-self-center rounded-sm border border-slate-400 bg-linear-to-br from-slate-600 via-slate-300 to-slate-50 p-2 shadow-lg">
                    <div
                      className="mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full text-center"
                      style={pointStyle}
                    >
                      {geometry?.x && (
                        <>
                          <div className="block text-xs">{numberFormatter.format(geometry?.x || 0)}</div>
                          <div className="block text-xs">{numberFormatter.format(geometry?.y || 0)}</div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
            <ErrorMessage errors={formState.errors} name="color" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={5} title="Place the point">
          <div>
            <Switch
              value={active}
              onChange={() => dispatch?.({ type: 'add-point/activate' })}
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
            <ErrorMessage errors={formState.errors} name="location" as={ErrorMessageTag} />
          </div>
        </NumberedFormSection>
        <NumberedFormSection number={0}>
          <Wizard finish={() => mutate} clear={onReset} status={wizardStatus} back={false} />
        </NumberedFormSection>
      </NumberedForm>
    </>
  );
}
