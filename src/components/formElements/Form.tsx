import type { FormEventHandler, ReactNode } from 'react';

type NumberedFormProps = {
  children: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export function NumberedForm({ children, onSubmit }: NumberedFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-10 flex w-full flex-col items-center justify-center">
      <div className="relative flex w-full flex-col gap-4 pl-6 after:absolute after:h-full after:border-l-2 after:border-sky-100 after:content-['']">
        {children}
      </div>
    </form>
  );
}

type NumberedFormSectionProps = {
  children: ReactNode;
  number: number;
  title?: ReactNode;
};

export function NumberedFormSection({ children, number, title }: NumberedFormSectionProps) {
  return (
    <>
      <div className="relative flex items-center font-semibold">
        <div className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-100 bg-white text-sky-500">
          {number > 0 ? number : '👍'}
        </div>
        <div className="ml-8 flex-1 uppercase">{title ? title : children}</div>
      </div>
      {title && <div className="mb-4 ml-8 flex flex-col gap-4">{children}</div>}
    </>
  );
}
