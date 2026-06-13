import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../api/firebase';

// Initial state reading from localStorage for persistence
const token = localStorage.getItem('token') || null;
const user = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Interceptor unwraps response so data is { user, token }
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      // Interceptor unwraps response so data is { user, token }
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed'
      );
    }
  }
);

// Google Sign-In via Google Identity Services (GSI)
// Opens the real Google account picker popup → returns { name, email, avatar }
function signInWithGSI() {
  return new Promise((resolve, reject) => {
    // Wait for the GSI script to load
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Sign-In is still loading, please try again'));
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error('NO_CLIENT_ID'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }
        try {
          const res = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
          );
          const profile = await res.json();
          resolve({
            name: profile.name || profile.given_name || profile.email?.split('@')[0],
            email: profile.email,
            avatar: profile.picture || '',
          });
        } catch (e) {
          reject(e);
        }
      },
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (userInput, { rejectWithValue }) => {
    try {
      let email, name, avatar = '';

      if (isFirebaseConfigured) {
        // Firebase Google popup
        const result = await signInWithPopup(auth, googleProvider);
        const u = result.user;
        email = u.email;
        name = u.displayName || u.email.split('@')[0];
        avatar = u.photoURL || '';
      } else {
        try {
          // Real Google popup via GSI
          const profile = await signInWithGSI();
          email = profile.email;
          name = profile.name;
          avatar = profile.avatar;
        } catch (gsiErr) {
          if (gsiErr.message === 'NO_CLIENT_ID' && userInput?.email && userInput?.name) {
            // Fallback: caller passed name/email directly
            email = userInput.email;
            name = userInput.name;
          } else if (gsiErr.message === 'NO_CLIENT_ID') {
            return rejectWithValue(
              'Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to frontend/.env'
            );
          } else {
            throw gsiErr;
          }
        }
      }

      // Send to backend — backend finds or creates the user, returns JWT + user with real name
      const response = await api.post('/auth/google', { email, name });
      const payload = response.data;

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.user.username)}&background=6c63ff&color=fff&size=128`;

      return {
        user: { ...payload.user, avatar: avatar || defaultAvatar },
        token: payload.token,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Google Sign-In failed'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google Sign-In
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
