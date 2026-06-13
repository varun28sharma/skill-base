import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const initialState = {
  videos: [],
  currentIndex: 0,
  loading: false,
  error: null,
};

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/videos');
      return response.data; // Expected array of video objects
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch videos');
    }
  }
);

export const createVideo = createAsyncThunk(
  'videos/createVideo',
  async (videoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/videos', videoData);
      return response.data; // Expected mapped video object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create video');
    }
  }
);

export const addComment = createAsyncThunk(
  'videos/addComment',
  async ({ videoId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/comments`, { text });
      return { videoId, comment: response.data }; // Expected comment object { id, username, avatar, text, timestamp }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
    }
  }
);

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    // For optimistic updates
    adjustLikeCountLocal: (state, action) => {
      const { videoId, amount } = action.payload;
      const video = state.videos.find((v) => v.id === videoId);
      if (video) {
        video.likesCount = Math.max(0, video.likesCount + amount);
      }
    },
    clearVideosError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { videoId, comment } = action.payload;
        const video = state.videos.find((v) => v.id === videoId);
        if (video) {
          if (!video.comments) video.comments = [];
          video.comments.push(comment);
          video.commentsCount = video.comments.length;
        }
      })
      // Create Video
      .addCase(createVideo.fulfilled, (state, action) => {
        state.videos.unshift(action.payload);
      });
  },
});

export const { setCurrentIndex, adjustLikeCountLocal, clearVideosError } = videosSlice.actions;
export default videosSlice.reducer;
