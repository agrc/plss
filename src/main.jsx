import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app/App.jsx';
import { AuthProvider } from './components/contexts/UserContext.jsx';
import '@arcgis/core/assets/esri/themes/light/main.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
