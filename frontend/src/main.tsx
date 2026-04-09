import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { autoLoadPlugins } from './core/plugin-loader';

async function bootstrap() {
  // Load plugins strictly before rendering React
  await autoLoadPlugins();
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap().catch(console.error);
