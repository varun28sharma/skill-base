import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import videosReducer from './videosSlice';
import interactionsReducer from './interactionsSlice';
import networkReducer from './networkSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    videos: videosReducer,
    interactions: interactionsReducer,
    network: networkReducer,
  },
});

export default store;
