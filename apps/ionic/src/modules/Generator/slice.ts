import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { GeneratorService } from './service';

export type GeneratorState = {
  imgUrl?: string;
  croppedImgUrl?: string;
  finishedImgUrl?: string;
  steps: string[];
  currentStep: number;
};

const initialState: GeneratorState = {
  steps: [],
  currentStep: 0,
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
    stepBack(state) {
      state.currentStep = Math.max(0, state.currentStep - 1);
    },
    stepForward(state) {
      state.currentStep = Math.min(
        state.steps.length - 1,
        state.currentStep + 1
      );
    },
  },
});

export const {
  setImg,
  setCroppedImg,
  setFinishedImg,
  setSteps,
  stepBack,
  stepForward,
} = generatorSlice.actions;
