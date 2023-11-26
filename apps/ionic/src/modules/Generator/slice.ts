import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { GeneratorService } from './service';

export type GeneratorState = {
  imgUrl?: string;
  croppedImgUrl?: string;
};

const initialState: GeneratorState = {
  imgUrl: undefined,
  croppedImgUrl: undefined,
};

export const generatorSlice = createSlice({
  name: 'generator',
  initialState,
  reducers: {
    setImgUrl(state, { payload }: PayloadAction<File | undefined>) {
      state.imgUrl = GeneratorService.getNewObjectUrl(state.imgUrl, payload);
    },
    setCroppedImgUrl(state, { payload }: PayloadAction<Blob | undefined>) {
      state.croppedImgUrl = GeneratorService.getNewObjectUrl(
        state.croppedImgUrl,
        payload
      );
    },
  },
});

export const { setImgUrl, setCroppedImgUrl } = generatorSlice.actions;
