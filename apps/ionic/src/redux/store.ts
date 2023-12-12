import { configureStore } from '@reduxjs/toolkit';

import { generatorSlice } from '@/modules/Generator/slice';

export const store = configureStore({
  reducer: {
    generator: generatorSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'generator/setImg',
          'generator/setCroppedImg',
          'generator/setFinishedImg',
        ],
      },
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
