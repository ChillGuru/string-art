import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OpenCvProvider } from 'opencv-react-ts';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import '../public/index.css';

import App from './App';
import { store } from './redux/store';

const container = document.getElementById('root');
const root = createRoot(container!);
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <OpenCvProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </OpenCvProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
