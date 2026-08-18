import type { ReactNode } from 'react';

type CardProps = {
  children?: ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <section className="inline-grid w-full gap-2 rounded-lg border border-slate-400 bg-white p-4 text-sm shadow-md">
      {children}
    </section>
  );
}