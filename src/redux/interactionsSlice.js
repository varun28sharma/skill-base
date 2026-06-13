import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { adjustLikeCountLocal } from './videosSlice';

// Load from localStorage for initial persistence
const initialLikes = JSON.parse(localStorage.getItem('likedVideos') || '{}');
const initialBookmarks = JSON.parse(localStorage.getItem('bookmarkedVideos') || '{}');

const initialState = {
  likedVideos: initialLikes, // { [videoId]: true/false }
  bookmarkedVideos: initialBookmarks, // { [videoId]: true/false }
  loading: false,
  error: null,
};

export const toggleLikeVideo = createAsyncThunk(
  'interactions/toggleLikeVideo',
  async (videoId, { dispatch, getState, rejectWithValue }) => {
    const isCurrentlyLiked = !!getState().interactions.likedVideos[videoId];
    
    // 1. Optimistic Update: toggle state & adjust like count locally
    dispatch(toggleLikeLocal(videoId));
    dispatch(adjustLikeCountLocal({ videoId, amount: isCurrentlyLiked ? -1 : 1 }));
    
    try {
      await api.post(`/videos/${videoId}/like`, { liked: !isCurrentlyLiked });
      
      // Update localStorage after success
      const updatedLikes = getState().interactions.likedVideos;
      localStorage.setItem('likedVideos', JSON.stringify(updatedLikes));
    } catch (err) {
      // 3. Revert local state and counts on failure
      dispatch(toggleLikeLocal(videoId));
      dispatch(adjustLikeCountLocal({ videoId, amount: isCurrentlyLiked ? 1 : -1 }));
      return rejectWithValue(err.response?.data?.message || 'Failed to save like');
    }
  }
);

export const toggleBookmarkVideo = createAsyncThunk(
  'interactions/toggleBookmarkVideo',
  async (videoId, { dispatch, getState, rejectWithValue }) => {
    const isCurrentlyBookmarked = !!getState().interactions.bookmarkedVideos[videoId];
    
    // 1. Optimistic Update: toggle locally
    dispatch(toggleBookmarkLocal(videoId));
    
    try {
      await api.post(`/videos/${videoId}/bookmark`, { bookmarked: !isCurrentlyBookmarked });
      
      // Update localStorage after success
      const updatedBookmarks = getState().interactions.bookmarkedVideos;
      localStorage.setItem('bookmarkedVideos', JSON.stringify(updatedBookmarks));
    } catch (err) {
      // 2. Revert on failure
      dispatch(toggleBookmarkLocal(videoId));
      return rejectWithValue(err.response?.data?.message || 'Failed to save bookmark');
    }
  }
);

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    toggleLikeLocal: (state, action) => {
      const videoId = action.payload;
      if (state.likedVideos[videoId]) {
        delete state.likedVideos[videoId];
      } else {
        state.likedVideos[videoId] = true;
      }
    },
    toggleBookmarkLocal: (state, action) => {
      const videoId = action.payload;
      if (state.bookmarkedVideos[videoId]) {
        delete state.bookmarkedVideos[videoId];
      } else {
        state.bookmarkedVideos[videoId] = true;
      }
    },
    clearInteractionsError: (state) => {
      state.error = null;
    }
  },
});

export const { toggleLikeLocal, toggleBookmarkLocal, clearInteractionsError } = interactionsSlice.actions;
export default interactionsSlice.reducer;
