import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import Main from './components/Main';
import './style.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Main />
  </StrictMode>
);
