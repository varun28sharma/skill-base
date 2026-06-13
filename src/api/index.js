import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to format timestamps to timeago strings
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'now';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'now';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  return 'just now';
};

// Map raw backend comment to frontend shape
const mapComment = (comment) => {
  if (!comment) return null;
  const username = comment.user ? comment.user.username : (comment.username || 'learner');
  const text = comment.content || comment.text || '';
  const timestamp = comment.created_at ? formatTimeAgo(comment.created_at) : (comment.timestamp || 'now');
  return {
    id: comment.id,
    username: username,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    text: text,
    timestamp: timestamp
  };
};

// Map raw backend video to frontend shape
const mapVideo = (video, baseUrl) => {
  if (!video) return null;
  return {
    id: video.id,
    url: video.file_path ? `${baseUrl}${video.file_path}` : (video.url || ''),
    title: video.title,
    description: video.description || '',
    category: video.category || 'General',
    likesCount: parseInt(video.like_count) || 0,
    commentsCount: video.comments ? video.comments.length : 0,
    isLiked: video.isLiked || false,
    isBookmarked: video.isBookmarked || false,
    comments: Array.isArray(video.comments) ? video.comments.map(mapComment) : [],
    creator: {
      name: 'Instructor',
      username: 'german_instructor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
      followersCount: '15K'
    },
    music: `Original Audio - German ${video.category || 'Lesson'}`
  };
};

const mapVideos = (videos, baseUrl) => {
  return Array.isArray(videos) ? videos.map(v => mapVideo(v, baseUrl)) : [];
};

// Response interceptor for 401 error redirect and live data mapping
api.interceptors.response.use(
  (response) => {
    // If the live API is active (API_URL is set), translate the raw PostgreSQL shape to frontend shape
    if (API_URL && response.data) {
      const livePayload = response.data.data; // Backend returns shape { data: ... }
      
      if (livePayload !== undefined) {
        const urlPath = response.config.url || '';
        const method = (response.config.method || '').toLowerCase();

        // 1. Fetching all videos or creating a video
        if (urlPath.endsWith('/videos')) {
          if (method === 'get') {
            response.data = mapVideos(livePayload, API_URL);
          } else if (method === 'post') {
            response.data = mapVideo(livePayload, API_URL);
          }
        }
        // 2. Fetching single video
        else if (urlPath.match(/\/videos\/[a-f0-9-]+$/) && method === 'get') {
          response.data = mapVideo(livePayload, API_URL);
        }
        // 3. Adding a comment
        else if (urlPath.match(/\/videos\/[a-f0-9-]+\/comments?$/) && method === 'post') {
          response.data = mapComment(livePayload);
        }
        // 4. Default wrapper unwrap
        else {
          response.data = livePayload;
        }
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ==========================================
   MOCK API LAYER FOR STANDALONE RUNNING
   Intercepts axios calls if no live API URL is set
   ========================================== */
if (!API_URL) {
  // Seed initial mock videos if not present in localStorage
  const defaultVideos = [
    {
      id: 'video-1',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-person-typing-on-a-computer-42358-large.mp4',
      title: 'Mastering CSS Flexbox in 30 Seconds',
      description: 'Quick walkthrough on centering content, ordering flex items, and dynamic wrapping. Essential for layout designers!',
      category: 'CSS Layout',
      likesCount: 1542,
      commentsCount: 3,
      comments: [
        { id: 'c1', username: 'code_newbie', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', text: 'This finally made flexbox click for me!', timestamp: '2h ago' },
        { id: 'c2', username: 'dev_guru', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', text: 'Great explanation. Keep them coming!', timestamp: '5h ago' },
        { id: 'c3', username: 'ui_designer_sam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', text: 'Nice production quality too. Minimalist design fits perfectly.', timestamp: '1d ago' },
      ],
      creator: {
        name: 'Sarah Jenkins',
        username: 'sarah_codes',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
        followersCount: '12K',
      },
      music: 'Original Audio - sarah_codes',
    },
    {
      id: 'video-2',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-a-coffee-shop-40156-large.mp4',
      title: 'Next.js 14 Server Actions vs API Routes',
      description: 'Why write API routes when you can just declare "use server"? Learn how server actions simplify mutation handling and state synchronizations.',
      category: 'React/NextJS',
      likesCount: 893,
      commentsCount: 2,
      comments: [
        { id: 'c4', username: 'next_fanboy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', text: 'Server actions are clean but be careful with error boundaries.', timestamp: '1h ago' },
        { id: 'c5', username: 'pragmatic_dev', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60', text: 'Are server actions secure by default?', timestamp: '3h ago' },
      ],
      creator: {
        name: 'Alex Rivera',
        username: 'alex_dev',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=60',
        followersCount: '4.8K',
      },
      music: 'Original Audio - alex_dev',
    },
    {
      id: 'video-3',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-with-a-vertical-screen-43232-large.mp4',
      title: 'Framer Motion Gestures Tutorial',
      description: 'Creating high-fidelity drag interfaces using Framer Motion. This is exactly how we built our bottom sheet comment component!',
      category: 'UI Animation',
      likesCount: 2311,
      commentsCount: 2,
      comments: [
        { id: 'c6', username: 'animation_addict', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60', text: 'Spring configuration makes such a big difference!', timestamp: '30m ago' },
        { id: 'c7', username: 'lucy_ui', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60', text: 'Can we use this for swipe left/right cards too?', timestamp: '10h ago' },
      ],
      creator: {
        name: 'Daniel Carter',
        username: 'dan_creates',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60',
        followersCount: '18K',
      },
      music: 'Original Audio - dan_creates',
    },
    {
      id: 'video-4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-using-a-smartphone-in-vertical-mode-43236-large.mp4',
      title: 'Redux Toolkit - Slice Pattern Explained',
      description: 'Stop writing boilerplate! Check out how Redux Toolkit combines actions, reducers, and initial state into a single cohesive slice definition.',
      category: 'State Mgmt',
      likesCount: 1205,
      commentsCount: 1,
      comments: [
        { id: 'c8', username: 'redux_soldier', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', text: 'RTK is so much better than old redux.', timestamp: '12h ago' },
      ],
      creator: {
        name: 'Jane Foster',
        username: 'jane_f',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60',
        followersCount: '9.3K',
      },
      music: 'Original Audio - jane_f',
    },
  ];

  if (!localStorage.getItem('mockVideos')) {
    localStorage.setItem('mockVideos', JSON.stringify(defaultVideos));
  }

  // Helper mock delay function
  const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

  // Intercept request configuration
  api.interceptors.request.use(async (config) => {
    const { url, method, data } = config;

    const getPayload = (d) => {
      if (!d) return {};
      if (typeof d === 'string') {
        try {
          return JSON.parse(d);
        } catch (e) {
          return {};
        }
      }
      return d;
    };

    // Handle authentication thunks
    if (url === '/auth/login' && method === 'post') {
      config.adapter = async () => {
        await delay(800);
        const { email } = getPayload(data);
        if (!email.includes('@')) {
          return {
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config,
            data: { message: 'Invalid email address' },
          };
        }
        const user = {
          id: 'user-123',
          name: email.split('@')[0],
          email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
        };
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: {
            user,
            token: 'mock-jwt-token-12345',
          },
        };
      };
    }

    if (url === '/auth/register' && method === 'post') {
      config.adapter = async () => {
        await delay(800);
        const { name, email } = getPayload(data);
        if (!name || !email.includes('@')) {
          return {
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config,
            data: { message: 'Please provide valid credentials' },
          };
        }
        const user = {
          id: 'user-123',
          name,
          email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
        };
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: {
            user,
            token: 'mock-jwt-token-12345',
          },
        };
      };
    }

    // Handle Videos Fetching
    if (url === '/videos' && method === 'get') {
      config.adapter = async () => {
        await delay(600);
        const videos = JSON.parse(localStorage.getItem('mockVideos'));
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: videos,
        };
      };
    }

    // Handle Like Toggle
    if (url.match(/^\/videos\/.+\/like$/) && method === 'post') {
      config.adapter = async () => {
        await delay(100);
        const videoId = url.split('/')[2];
        const { liked } = getPayload(data);
        const videos = JSON.parse(localStorage.getItem('mockVideos')) || [];
        const updated = videos.map((v) => {
          if (v.id === videoId) {
            v.likesCount = liked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1);
          }
          return v;
        });
        localStorage.setItem('mockVideos', JSON.stringify(updated));
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: { success: true },
        };
      };
    }

    // Handle Bookmark Toggle
    if (url.match(/^\/videos\/.+\/bookmark$/) && method === 'post') {
      config.adapter = async () => {
        await delay(100);
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: { success: true },
        };
      };
    }

    // Handle Add Comment
    if (url.match(/^\/videos\/.+\/comments$/) && method === 'post') {
      config.adapter = async () => {
        await delay(200);
        const videoId = url.split('/')[2];
        const { text } = getPayload(data);
        const videos = JSON.parse(localStorage.getItem('mockVideos')) || [];

        // Fetch current authenticated user
        const authUser = JSON.parse(localStorage.getItem('user')) || {
          name: 'Anonymous Learner',
          email: 'anon@learn.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
        };

        const newComment = {
          id: `comment-${Date.now()}`,
          username: authUser.name.toLowerCase().replace(/\s/g, '_'),
          avatar: authUser.avatar,
          text,
          timestamp: 'Just now',
        };

        const updated = videos.map((v) => {
          if (v.id === videoId) {
            if (!v.comments) v.comments = [];
            v.comments.push(newComment);
            v.commentsCount = v.comments.length;
          }
          return v;
        });

        localStorage.setItem('mockVideos', JSON.stringify(updated));

        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          data: newComment,
        };
      };
    }

    return config;
  });
}

export default api;
