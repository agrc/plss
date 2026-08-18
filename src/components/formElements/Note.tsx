import type { ReactNode } from 'react';

type NoteProps = {
  children: ReactNode;
};

export default function Note({ children }: NoteProps) {
  return (
    <p className="border bg-slate-50 p-3 text-xs leading-tight text-balance">
      {children}
    </p>
  );
}