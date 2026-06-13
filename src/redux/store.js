import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videosReducer from './videosSlice';
import interactionsReducer from './interactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    interactions: interactionsReducer,
  },
});

export default store;
