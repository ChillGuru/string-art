import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { GeneratorService } from './service';

export type GeneratorState = {
  imgUrl?: string;
  croppedImgUrl?: string;
  finishedImgUrl?: string;
  steps: string[];
};

const initialState: GeneratorState = {
  steps: [],
};

export const generatorSlice = createSlice({
  name: 'generator',
  initialState,
  reducers: {
    setImg(state, { payload }: PayloadAction<File | undefined>) {
      state.imgUrl = GeneratorService.getNewObjectUrl(state.imgUrl, payload);
    },
    setCroppedImg(state, { payload }: PayloadAction<Blob | undefined>) {
      state.croppedImgUrl = GeneratorService.getNewObjectUrl(
        state.croppedImgUrl,
        payload
      );
    },
    setFinishedImg(state, { payload }: PayloadAction<Blob | undefined>) {
      state.finishedImgUrl = GeneratorService.getNewObjectUrl(
        state.finishedImgUrl,
        payload
      );
    },
    setSteps(state, { payload }: PayloadAction<string[]>) {
      state.steps = payload;
    },
  },
});

export const { setImg, setCroppedImg, setFinishedImg, setSteps } =
  generatorSlice.actions;
