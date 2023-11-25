import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type GeneratorState = {
  imgUrl?: string;
};

const initialState: GeneratorState = {
  imgUrl: undefined,
};

export const generatorSlice = createSlice({
  name: 'generator',
  initialState,
  reducers: {
    setImgUrl(state, action: PayloadAction<File | undefined>) {
      if (state.imgUrl) {
        URL.revokeObjectURL(state.imgUrl);
      }
      if (action.payload) {
        state.imgUrl = URL.createObjectURL(action.payload);
      } else {
        state.imgUrl = action.payload;
      }
    },
  },
});

export const { setImgUrl } = generatorSlice.actions;
