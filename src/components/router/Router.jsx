import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

const Loading = () => (
  <p className="h-full w-full p-4 text-center">Loading...</p>
);

const IndexScreen = lazy(() => import('../pages/Index.jsx'));

export const Router = () => {
  return (
    <Suspense fallback={<Loading />}>
      <BrowserRouter>
        <main className="app grid h-full w-screen">
          <IndexScreen />
        </main>
      </BrowserRouter>
    </Suspense>
  );
};
