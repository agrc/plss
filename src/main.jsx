import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './components/app/App.jsx';
import { AuthProvider } from './components/contexts/AuthContext.jsx';
import '@arcgis/core/assets/esri/themes/light/main.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
    }
  >
    <StrictMode>
      <AuthProvider>
        <App />
        <ReactQueryDevtools />
      </AuthProvider>
    </StrictMode>
  </QueryClientProvider>
);
