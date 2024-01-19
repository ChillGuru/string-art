import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AssemblyLayerData } from './models';
import { GeneratorService } from './service';

export type GeneratorState = {
  imgUrl?: string;
  croppedImgUrl?: string;
  finishedImgUrl?: string;
  layers: Record<string, AssemblyLayerData>;
};

const initialState: GeneratorState = {
  layers: {},
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

    setLayers(state, { payload }: PayloadAction<GeneratorState['layers']>) {
      state.layers = payload;
    },

    stepBack(state, { payload }: PayloadAction<string>) {
      state.layers[payload].currentStep = Math.max(
        0,
        state.layers[payload].currentStep - 1
      );
    },

    stepForward(state, { payload }: PayloadAction<string>) {
      state.layers[payload].currentStep = Math.min(
        state.layers[payload].steps.length - 1,
        state.layers[payload].currentStep + 1
      );
    },
  },
});

export const {
  setImg,
  setCroppedImg,
  setFinishedImg,
  setLayers,
  stepBack,
  stepForward,
} = generatorSlice.actions;
