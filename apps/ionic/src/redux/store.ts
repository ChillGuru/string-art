import { configureStore } from '@reduxjs/toolkit';

import { alertsSlice } from '@/modules/Alerts/slice';
import { generatorSlice } from '@/modules/Generator/slice';

export const store = configureStore({
  reducer: {
    generator: generatorSlice.reducer,
    alerts: alertsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'generator/setImg',
          'generator/setCroppedImg',
          'generator/setFinishedImg',
          'generator/setLayers',
        ],
        ignoredPaths: ['generator.layers'],
      },
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
