import { createSlice } from '@reduxjs/toolkit';

export type AlertsState = {
  saveImgAlertSeen: boolean;
};

const localStorageKey = 'alertsSlice';

function getInitialState(): AlertsState {
  const persisted = localStorage.getItem(localStorageKey);

  const parsed = persisted ? (JSON.parse(persisted) as AlertsState) : undefined;

  return (
    parsed ?? {
      saveImgAlertSeen: false,
    }
  );
}

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState: getInitialState(),
  reducers: {
    hideSaveImgAlert(state) {
      state.saveImgAlertSeen = true;
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    },
  },
});

export const { hideSaveImgAlert } = alertsSlice.actions;
