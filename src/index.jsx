import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import WrappedSecuredApp from './WrappedSecuredApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WrappedSecuredApp />
  </React.StrictMode>,
);
