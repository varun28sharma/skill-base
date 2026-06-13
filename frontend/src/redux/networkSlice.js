import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const initialState = {
  followers: [],
  following: [],
  suggested: [],
  requests: [], // Pending incoming follow requests
  followStatuses: {}, // { [userId]: 'following' | 'requested' | 'none' }
  loading: false,
  error: null,
};

export const fetchNetwork = createAsyncThunk(
  'network/fetchNetwork',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/network');
      return response.data; // Already unwrapped by interceptor
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch network');
    }
  }
);

export const toggleFollowUser = createAsyncThunk(
  'network/toggleFollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      // Already unwrapped by interceptor
      return { userId, isFollowing: response.data.isFollowing };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle follow');
    }
  }
);

export const acceptFollowRequest = createAsyncThunk(
  'network/acceptFollowRequest',
  async (senderId, { rejectWithValue }) => {
    try {
      await api.post(`/users/follow-requests/${senderId}/accept`);
      return { senderId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept follow request');
    }
  }
);

export const rejectFollowRequest = createAsyncThunk(
  'network/rejectFollowRequest',
  async (senderId, { rejectWithValue }) => {
    try {
      await api.post(`/users/follow-requests/${senderId}/reject`);
      return { senderId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject follow request');
    }
  }
);

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch network
      .addCase(fetchNetwork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload.followers;
        state.following = action.payload.following;
        state.suggested = action.payload.suggested;
        state.requests = action.payload.requests || [];

        // Build follow status map
        const statuses = {};
        action.payload.following.forEach(u => {
          statuses[u.id] = 'following';
        });
        action.payload.suggested.forEach(u => {
          statuses[u.id] = u.is_following === 'requested' ? 'requested' : (u.is_following === true ? 'following' : 'none');
        });
        action.payload.followers.forEach(u => {
          if (!statuses[u.id]) {
            statuses[u.id] = u.is_following === 'requested' ? 'requested' : (u.is_following === true ? 'following' : 'none');
          }
        });
        state.followStatuses = statuses;
      })
      .addCase(fetchNetwork.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle follow
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;

        const updateList = (list) => {
          const user = list.find(u => u.id === userId);
          if (user) {
            user.is_following = isFollowing;
          }
        };

        updateList(state.suggested);
        updateList(state.followers);
        updateList(state.following);

        // Update status map
        if (isFollowing === true) {
          state.followStatuses[userId] = 'following';
          
          // Add to following list
          const alreadyFollowing = state.following.some(u => u.id === userId);
          if (!alreadyFollowing) {
            const userSrc = state.suggested.find(u => u.id === userId) || state.followers.find(u => u.id === userId);
            if (userSrc) {
              state.following.push({ ...userSrc, is_following: true });
            } else {
              state.following.push({ id: userId, is_following: true });
            }
          }
        } else if (isFollowing === 'requested') {
          state.followStatuses[userId] = 'requested';
          state.following = state.following.filter(u => u.id !== userId);
        } else {
          state.followStatuses[userId] = 'none';
          state.following = state.following.filter(u => u.id !== userId);
        }
      })
      // Accept Request
      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        const { senderId } = action.payload;
        const requestUser = state.requests.find(r => r.id === senderId);
        
        state.requests = state.requests.filter(r => r.id !== senderId);

        // Add to followers list
        if (requestUser) {
          const alreadyFollower = state.followers.some(f => f.id === senderId);
          if (!alreadyFollower) {
            state.followers.push({ ...requestUser, is_following: false });
          }
        }
      })
      // Reject Request
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        const { senderId } = action.payload;
        state.requests = state.requests.filter(r => r.id !== senderId);
      });
  },
});

export default networkSlice.reducer;
