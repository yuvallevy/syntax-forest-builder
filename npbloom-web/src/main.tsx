import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import AppWithContext from './AppWithContext.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppWithContext />
  </React.StrictMode>,
);
