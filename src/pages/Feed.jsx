import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos, setCurrentIndex, createVideo } from '../redux/videosSlice';
import { fetchNetwork, toggleFollowUser, acceptFollowRequest, rejectFollowRequest } from '../redux/networkSlice';
import VideoCard from '../components/VideoCard';
import NavBar from '../components/NavBar';
import Skeleton from '../components/Skeleton';
import QuickAccessPanel from '../components/QuickAccessPanel';
import { logout } from '../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  BookOpen,
  Award,
  Users,
  Search,
  Bookmark,
  Eye,
  Grid,
  Film,
  Lock,
  Plus,
  Menu,
  Settings,
  Link,
  ChevronDown,
  UserPlus,
  Play,
  X,
  Bell,
  UploadCloud
} from 'lucide-react';

export default function Feed() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'explore' | 'profile'
  const [profileActiveTab, setProfileActiveTab] = useState('grid'); // 'grid' | 'reels' | 'saved'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Upload Form States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('German');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid video file.');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadDesc.trim() || !selectedFile) {
      alert('Please fill out all fields and select a video file.');
      return;
    }

    dispatch(createVideo({
      title: uploadTitle.trim(),
      description: uploadDesc.trim(),
      category: uploadCategory,
      file: selectedFile
    }))
      .unwrap()
      .then(() => {
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadDesc('');
        setUploadCategory('German');
        setSelectedFile(null);
        // Snap back to home feed and start from top
        setActiveTab('home');
        dispatch(setCurrentIndex(0));
      })
      .catch((err) => {
        alert(`Failed to publish lesson: ${err}`);
      });
  };
  
  const containerRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  const { videos, currentIndex, loading } = useSelector((state) => state.videos);
  const bookmarkedVideos = useSelector((state) => state.interactions.bookmarkedVideos);
  const user = useSelector((state) => state.auth.user);
  const { followers = [], following = [], suggested = [], requests = [], followStatuses = {} } = useSelector((state) => state.network || {});

  const getFollowState = (userId, defaultIsFollowing) => {
    const status = followStatuses[userId];
    if (status) return status; // 'following' | 'requested' | 'none'
    if (defaultIsFollowing === 'requested') return 'requested';
    if (defaultIsFollowing === true) return 'following';
    return 'none';
  };

  useEffect(() => {
    // Fetch videos if not loaded
    if (videos.length === 0) {
      dispatch(fetchVideos());
    }
  }, [dispatch, videos.length]);

  useEffect(() => {
    if (user) {
      dispatch(fetchNetwork());
    }
  }, [dispatch, user]);

  // Handle scroll snap index detection & header visibility
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    
    // Check if scrolling down or up
    const isScrollingDown = currentScrollTop > lastScrollTopRef.current;
    
    if (currentScrollTop <= 15) {
      setIsHeaderVisible(true);
    } else if (isScrollingDown && isHeaderVisible) {
      setIsHeaderVisible(false);
    } else if (!isScrollingDown && !isHeaderVisible) {
      setIsHeaderVisible(true);
    }
    
    lastScrollTopRef.current = currentScrollTop;
    
    const height = container.clientHeight;
    if (height === 0) return;
    
    const scrolledIndex = Math.round(container.scrollTop / height);
    if (scrolledIndex !== currentIndex && scrolledIndex >= 0 && scrolledIndex < getDisplayVideos().length) {
      dispatch(setCurrentIndex(scrolledIndex));
    }
  };

  // Helper to filter videos based on current tab, active category and search query
  const getDisplayVideos = () => {
    let list = videos;

    // Apply active category filter
    if (activeCategory && activeCategory !== 'All') {
      const catFilter = activeCategory.toLowerCase();
      list = list.filter((v) => {
        const vCat = v.category.toLowerCase();
        if (catFilter === 'web dev') {
          return (
            vCat.includes('css') ||
            vCat.includes('react') ||
            vCat.includes('next') ||
            vCat.includes('ui') ||
            vCat.includes('state') ||
            vCat.includes('web')
          );
        }
        if (catFilter === 'react') {
          return vCat.includes('react');
        }
        // Substring / exact checks for others
        return vCat.includes(catFilter) || catFilter.includes(vCat);
      });
    }

    // Apply search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          (v.creator && (
            v.creator.name.toLowerCase().includes(q) ||
            v.creator.username.toLowerCase().includes(q)
          ))
      );
    }

    return list;
  };

  // Switch tabs -> reset index
  useEffect(() => {
    dispatch(setCurrentIndex(0));
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const displayVideos = getDisplayVideos();

  // Render Sub-Views
  const renderContent = () => {
    if (loading && videos.length === 0) {
      return (
        <div style={styles.scrollContainer}>
          <Skeleton />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        if (displayVideos.length === 0) {
          return (
            <div style={styles.emptyContainer}>
              <Bookmark size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>No lessons found</h3>
              <p style={styles.emptyDesc}>Check back later for new uploads.</p>
            </div>
          );
        }

        return (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="feed-container"
            style={styles.scrollContainer}
          >
            {displayVideos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                isActiveCard={idx === currentIndex}
              />
            ))}
          </div>
        );

      case 'explore': {
        // Explore view displaying search input, quick category pills, and a 2-column grid of lessons
        return (
          <div style={styles.exploreView} className="comment-list-scroll">
            <style>{`
              .explore-grid-card {
                position: relative;
                aspect-ratio: 9 / 16;
                background-color: #111111;
                border-radius: 12px;
                cursor: pointer;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.05);
                transition: transform 0.2s ease, border-color 0.2s ease;
              }
              .explore-grid-card:hover {
                transform: translateY(-2px);
                border-color: rgba(108, 99, 255, 0.4);
              }
              .explore-grid-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .explore-card-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 10px;
                background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%);
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .explore-card-title {
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                line-height: 1.3;
                text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.8);
                display: -webkit-box;
                WebkitLineClamp: 2;
                WebkitBoxOrient: 'vertical';
                overflow: hidden;
              }
              .explore-card-category {
                font-size: 8px;
                font-weight: 600;
                color: #ffffff;
                background-color: rgba(108, 99, 255, 0.8);
                padding: 2px 6px;
                borderRadius: 4px;
                width: fit-content;
                text-transform: uppercase;
              }
            `}</style>

            <div style={styles.exploreHeader}>
              <h2 style={styles.exploreTitle}>Explore Lessons</h2>
              <div style={styles.exploreSearchContainer}>
                <Search size={16} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search categories, titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.exploreSearchInput}
                />
              </div>
            </div>

            {suggested && suggested.length > 0 && (
              <div style={{
                padding: '0 16px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  margin: 0
                }}>Suggested Creators</h3>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  paddingBottom: '4px',
                }} className="comment-list-scroll">
                  {suggested.map((sugUser) => {
                    const fState = getFollowState(sugUser.id, sugUser.is_following);
                    const isSugFollowing = fState === 'following';
                    const isSugRequested = fState === 'requested';
                    const btnLabel = isSugFollowing ? 'Following' : (isSugRequested ? 'Requested' : 'Follow');
                    return (
                      <div key={sugUser.id} style={{
                        flexShrink: 0,
                        width: '120px',
                        backgroundColor: '#0f0f0f',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '12px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '4px',
                      }}>
                        <img src={sugUser.avatar} alt={sugUser.username} style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: '4px',
                          border: '1.5px solid rgba(108, 99, 255, 0.4)',
                        }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                        }}>{sugUser.name}</span>
                        <span style={{
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.4)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          marginBottom: '4px',
                        }}>@{sugUser.username}</span>
                        <button
                          onClick={() => dispatch(toggleFollowUser(sugUser.id))}
                          style={{
                            width: '100%',
                            borderRadius: '6px',
                            padding: '6px 0',
                            fontSize: '10px',
                            fontWeight: '700',
                            color: isSugFollowing ? 'rgba(255,255,255,0.6)' : (isSugRequested ? 'rgba(255,255,255,0.5)' : '#ffffff'),
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            background: isSugFollowing 
                              ? 'rgba(255,255,255,0.08)' 
                              : (isSugRequested 
                                  ? 'rgba(255,255,255,0.05)' 
                                  : 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)'),
                            border: (isSugFollowing || isSugRequested) ? '1px solid rgba(255,255,255,0.1)' : 'none'
                          }}
                        >
                          {btnLabel}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={styles.exploreCategoriesScroll} className="comment-list-scroll">
              {['All', 'German', 'DSA', 'Web Dev', 'AI', 'System Design', 'React', 'Python'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                  style={{
                    ...styles.exploreCategoryBtn,
                    background: activeCategory === cat 
                      ? 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)' 
                      : '#161616',
                    borderColor: activeCategory === cat ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {displayVideos.length === 0 ? (
              <div style={styles.exploreEmpty}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  No lessons match your search or filter.
                </span>
              </div>
            ) : (
              <div style={styles.exploreGrid}>
                {displayVideos.map((video) => {
                  const origIndex = videos.findIndex((v) => v.id === video.id);
                  return (
                    <div
                      key={video.id}
                      onClick={() => {
                        setActiveCategory('All');
                        dispatch(setCurrentIndex(origIndex));
                        setActiveTab('home');
                      }}
                      onMouseEnter={(e) => {
                        const videoEl = e.currentTarget.querySelector('video');
                        if (videoEl) videoEl.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        const videoEl = e.currentTarget.querySelector('video');
                        if (videoEl) {
                          videoEl.pause();
                          videoEl.currentTime = 0;
                        }
                      }}
                      className="explore-grid-card"
                    >
                      <video src={video.url} className="explore-grid-video" muted playsInline />
                      <div className="explore-card-info">
                        <span className="explore-card-category">{video.category}</span>
                        <h4 className="explore-card-title">{video.title}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'profile': {
        const savedCount = Object.keys(bookmarkedVideos).length;
        const profileVideos = profileActiveTab === 'saved'
          ? videos.filter((v) => !!bookmarkedVideos[v.id])
          : videos.filter((v) => v.creator?.id === user?.id);

        return (
          <div style={styles.profileView} className="comment-list-scroll">
            <style>{`
              .comment-list-scroll {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
              .comment-list-scroll::-webkit-scrollbar {
                display: none;
              }
              .ig-grid-card {
                position: relative;
                aspect-ratio: 1 / 1;
                background-color: #111111;
                cursor: pointer;
                overflow: hidden;
              }
              .ig-grid-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .ig-grid-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.45);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
              }
              .ig-grid-card:hover .ig-grid-overlay {
                opacity: 1;
              }
              .ig-grid-overlay-text {
                color: #ffffff;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 4px;
              }
            `}</style>

            {/* Header bar */}
            <div style={styles.igHeader}>
              <div style={styles.igHeaderLeft}>
                <Lock size={12} color="#ffffff" style={{ marginRight: '4px' }} />
                <span style={styles.igUsername}>
                  {user?.username ? user.username.toLowerCase() : 'developer_learner'}
                </span>
                <ChevronDown size={12} color="#ffffff" style={{ marginLeft: '4px' }} />
              </div>
              <div style={styles.igHeaderRight}>
                <button style={styles.igHeaderBtn} onClick={() => setIsUploadOpen(true)}>
                  <Plus size={20} color="#ffffff" />
                </button>
                <button 
                  style={{ ...styles.igHeaderBtn, position: 'relative' }} 
                  onClick={() => setIsNotificationsOpen(true)}
                >
                  <Bell size={20} color="#ffffff" />
                  {requests && requests.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      backgroundColor: '#ff4757',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '800',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }}>
                      {requests.length}
                    </span>
                  )}
                </button>
                <button style={styles.igHeaderBtn} onClick={handleLogout}>
                  <LogOut size={18} color="#ffffff" />
                </button>
              </div>
            </div>

            {/* Avatar and stats */}
            <div style={styles.igProfileInfo}>
              <div style={styles.igAvatarWrapper}>
                <div style={styles.igAvatarGradient}>
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                    alt="Profile"
                    style={styles.igAvatarImg}
                  />
                </div>
              </div>
              <div style={styles.igStatsContainer}>
                <div style={styles.igStatCol}>
                  <span style={styles.igStatNum}>{videos.length}</span>
                  <span style={styles.igStatLabel}>Posts</span>
                </div>
                <div style={styles.igStatCol} onClick={() => setIsFollowersOpen(true)}>
                  <span style={styles.igStatNum}>{followers.length}</span>
                  <span style={styles.igStatLabel}>Followers</span>
                </div>
                <div style={styles.igStatCol} onClick={() => setIsFollowingOpen(true)}>
                  <span style={styles.igStatNum}>{following.length}</span>
                  <span style={styles.igStatLabel}>Following</span>
                </div>
              </div>
            </div>

            {/* Bio Block */}
            <div style={styles.igBioContainer}>
              <h3 style={styles.igDisplayName}>{user?.username || 'Developer Learner'}</h3>
              <span style={styles.igCategory}>Education Website</span>
              <p style={styles.igBioText}>
                🚀 Continuous learning, one 30-second snippet at a time.<br />
                💻 Sharing tips about CSS, React, and UI/UX design.
              </p>
              <a href={`mailto:${user?.email || 'student@skillbase.edu'}`} style={styles.igBioLink}>
                <Link size={12} style={{ marginRight: '4px' }} />
                {user?.email || 'student@skillbase.edu'}
              </a>
            </div>

            {/* Action Buttons */}
            <div style={styles.igActionsRow}>
              <button style={styles.igActionButton} onClick={() => alert('Profile Editing is coming soon!')}>
                Edit Profile
              </button>
              <button style={styles.igActionButton} onClick={() => alert('Profile link copied to clipboard!')}>
                Share Profile
              </button>
              <button style={styles.igActionIconBtn} onClick={() => setProfileActiveTab('saved')}>
                <Bookmark size={15} color="#ffffff" />
              </button>
            </div>

            {/* Highlights */}
            <div style={styles.igHighlightsScroll} className="comment-list-scroll">
              <div style={styles.igHighlightItem} onClick={() => alert('React Highlights')}>
                <div style={styles.igHighlightCircle}>
                  <BookOpen size={18} color="#ffffff" />
                </div>
                <span style={styles.igHighlightLabel}>React</span>
              </div>
              <div style={styles.igHighlightItem} onClick={() => setActiveTab('explore')}>
                <div style={styles.igHighlightCircle}>
                  <Search size={18} color="#ffffff" />
                </div>
                <span style={styles.igHighlightLabel}>Explore</span>
              </div>
              <div style={styles.igHighlightItem} onClick={() => setProfileActiveTab('saved')}>
                <div style={styles.igHighlightCircle}>
                  <Bookmark size={18} color="#ffffff" />
                </div>
                <span style={styles.igHighlightLabel}>Saved</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={styles.igTabsRow}>
              <button
                onClick={() => setProfileActiveTab('grid')}
                style={{
                  ...styles.igTabButton,
                  borderTop: profileActiveTab === 'grid' ? '1.5px solid #ffffff' : '1.5px solid transparent',
                  color: profileActiveTab === 'grid' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setProfileActiveTab('reels')}
                style={{
                  ...styles.igTabButton,
                  borderTop: profileActiveTab === 'reels' ? '1.5px solid #ffffff' : '1.5px solid transparent',
                  color: profileActiveTab === 'reels' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <Film size={18} />
              </button>
              <button
                onClick={() => setProfileActiveTab('saved')}
                style={{
                  ...styles.igTabButton,
                  borderTop: profileActiveTab === 'saved' ? '1.5px solid #ffffff' : '1.5px solid transparent',
                  color: profileActiveTab === 'saved' ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <Bookmark size={18} />
              </button>
            </div>

            {/* Grid media container */}
            {profileVideos.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                textAlign: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.3)'
                }}>
                  {profileActiveTab === 'saved' ? <Bookmark size={28} /> : <Film size={28} />}
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>
                    {profileActiveTab === 'saved' ? 'No Saved Lessons' : 'No Video Lessons Published'}
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', maxWidth: '240px', margin: '0 auto' }}>
                    {profileActiveTab === 'saved' 
                      ? 'Lessons you bookmark will appear here in your saved collection.' 
                      : 'Share your knowledge with others by publishing your first short-video lesson!'}
                  </p>
                </div>
                {profileActiveTab !== 'saved' && (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    style={{
                      marginTop: '8px',
                      background: 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
                    }}
                  >
                    Upload Video Lesson
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.igMediaGrid}>
                {profileVideos.map((video) => {
                  const origIndex = videos.findIndex((v) => v.id === video.id);
                  return (
                    <div
                      key={video.id}
                      onClick={() => {
                        dispatch(setCurrentIndex(origIndex));
                        setActiveTab('home');
                      }}
                      onMouseEnter={(e) => {
                        const videoEl = e.currentTarget.querySelector('video');
                        if (videoEl) videoEl.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        const videoEl = e.currentTarget.querySelector('video');
                        if (videoEl) {
                          videoEl.pause();
                          videoEl.currentTime = 0;
                        }
                      }}
                      className="ig-grid-card"
                    >
                      <video src={video.url} className="ig-grid-video" muted playsInline />
                      <div className="ig-grid-overlay">
                        <span className="ig-grid-overlay-text">
                          {profileActiveTab === 'reels' ? (
                            <>
                              <Play size={12} fill="#ffffff" style={{ marginRight: '2px' }} />
                              {video.likesCount * 3 + 12}
                            </>
                          ) : (
                            <>
                              <Eye size={12} style={{ marginRight: '2px' }} />
                              {video.likesCount}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const renderNotificationsModal = () => {
    if (!isNotificationsOpen) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={() => setIsNotificationsOpen(false)}
      >
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '360px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              margin: 0
            }}>Notifications</h3>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }} onClick={() => setIsNotificationsOpen(false)}>
              <X size={20} color="#ffffff" />
            </button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px',
          }} className="comment-list-scroll">
            <h4 style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '8px 0 16px 0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Follow Requests</h4>
            {requests.length === 0 ? (
              <div style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '32px 16px',
              }}>
                No new follow requests.
              </div>
            ) : (
              requests.map((reqUser) => (
                <div key={reqUser.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #121212',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <img src={reqUser.avatar} alt={reqUser.username} style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }} />
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <span style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>@{reqUser.username}</span>
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '11px',
                      }}>{reqUser.name}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => dispatch(acceptFollowRequest(reqUser.id))}
                      style={{
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none',
                        border: 'none',
                        backgroundColor: '#6c63ff',
                        color: '#ffffff',
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => dispatch(rejectFollowRequest(reqUser.id))}
                      style={{
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkModal = (type) => {
    const isOpen = type === 'followers' ? isFollowersOpen : isFollowingOpen;
    const setIsOpen = type === 'followers' ? setIsFollowersOpen : setIsFollowingOpen;
    const list = type === 'followers' ? followers : following;
    const title = type === 'followers' ? 'Followers' : 'Following';

    if (!isOpen) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={() => setIsOpen(false)}
      >
        <div
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '360px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              margin: 0
            }}>{title}</h3>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }} onClick={() => setIsOpen(false)}>
              <X size={20} color="#ffffff" />
            </button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px',
          }} className="comment-list-scroll">
            {list.length === 0 ? (
              <div style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '32px 16px',
              }}>
                No users found.
              </div>
            ) : (
              list.map((u) => {
                const fState = getFollowState(u.id, u.is_following);
                const isUserFollowing = fState === 'following';
                const isUserRequested = fState === 'requested';
                const btnLabel = isUserFollowing ? 'Following' : (isUserRequested ? 'Requested' : 'Follow');
                return (
                  <div key={u.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #121212',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <img src={u.avatar} alt={u.username} style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }} />
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <span style={{
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>@{u.username}</span>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: '11px',
                        }}>{u.name}</span>
                      </div>
                    </div>
                    
                    {user?.id !== u.id && (
                      <button
                        onClick={() => dispatch(toggleFollowUser(u.id))}
                        style={{
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: isUserFollowing 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : (isUserRequested 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : '#6c63ff'),
                          color: isUserFollowing ? 'rgba(255,255,255,0.6)' : (isUserRequested ? 'rgba(255,255,255,0.5)' : '#ffffff'),
                          border: (isUserFollowing || isUserRequested) ? '1px solid rgba(255,255,255,0.2)' : 'none'
                        }}
                      >
                        {btnLabel}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const showHeader = activeTab === 'home';

  return (
    <div style={styles.feedWrapper}>
      {/* Top Header & Categories Block */}
      {showHeader && (
        <motion.div
          animate={{ y: isHeaderVisible ? 0 : -100 }}
          transition={{ type: 'spring', damping: 22, stiffness: 150 }}
          style={styles.feedHeaderBlock}
        >
          {/* Logo & Search Row */}
          <div style={styles.logoSearchRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={styles.logoIcon}>
                <Play size={10} color="#ffffff" fill="#ffffff" />
              </div>
              <span style={styles.logoText}>Skillbase</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setIsUploadOpen(true)} 
                style={styles.headerUploadBtn}
                title="Add New Lesson"
              >
                <Plus size={16} color="#ffffff" />
              </button>
              <div style={styles.topSearchContainer}>
                <Search size={14} color="rgba(255, 255, 255, 0.5)" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    dispatch(setCurrentIndex(0));
                  }}
                  style={styles.topSearchInput}
                />
              </div>
            </div>
          </div>

          {/* Category Pills single row */}
          <div style={styles.categoryPillsContainer}>
            <div style={styles.pillRow} className="comment-list-scroll">
              {['All', 'German', 'DSA', 'Web Dev', 'AI', 'System Design', 'React', 'Python'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    dispatch(setCurrentIndex(0));
                  }}
                  style={{
                    ...styles.categoryPill,
                    background: activeCategory === cat 
                      ? 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    borderColor: activeCategory === cat ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    boxShadow: activeCategory === cat ? '0 4px 12px rgba(108, 99, 255, 0.3)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="main-content-area" style={styles.mainContentContainer}>
        {renderContent()}
      </div>

      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {isUploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalWrapper}
          >
            {/* Backdrop */}
            <div
              onClick={() => setIsUploadOpen(false)}
              style={styles.modalBackdrop}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="comment-list-scroll"
              style={styles.modalContent}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Publish New Lesson</h3>
                <button onClick={() => setIsUploadOpen(false)} style={styles.modalCloseBtn}>
                  <X size={18} color="#ffffff" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} style={styles.modalForm}>
                <div style={styles.modalFieldGroup}>
                  <label style={styles.modalLabel}>Lesson Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Learning German Accusative Cases"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.modalFieldGroup}>
                  <label style={styles.modalLabel}>Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a brief breakdown of what this lesson covers..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    style={styles.modalTextarea}
                  />
                </div>

                <div style={styles.modalFieldGroup}>
                  <label style={styles.modalLabel}>Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={styles.modalSelect}
                  >
                    <option value="German">German</option>
                    <option value="DSA">DSA</option>
                    <option value="Web Dev">Web Dev</option>
                    <option value="AI">AI</option>
                    <option value="System Design">System Design</option>
                    <option value="React">React</option>
                    <option value="Python">Python</option>
                  </select>
                </div>

                <div style={styles.modalFieldGroup}>
                  <label style={styles.modalLabel}>Select Video Lesson File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="video/*"
                    style={{ display: 'none' }}
                  />
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    style={{
                      ...styles.dragDropZone,
                      borderColor: isDragging ? '#6c63ff' : 'rgba(255,255,255,0.15)',
                      backgroundColor: isDragging ? 'rgba(108, 99, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {selectedFile ? (
                      <div style={styles.selectedFileContainer}>
                        <Film size={28} color="#6c63ff" />
                        <div style={styles.selectedFileMeta}>
                          <span style={styles.selectedFileName}>{selectedFile.name}</span>
                          <span style={styles.selectedFileSize}>
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          style={styles.removeFileBtn}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div style={styles.dropZonePlaceholder}>
                        <UploadCloud size={28} color="rgba(255,255,255,0.4)" style={{ marginBottom: '8px' }} />
                        <span style={styles.dropZoneMainText}>Drag & drop video here</span>
                        <span style={styles.dropZoneSubText}>or click to browse files</span>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" style={styles.modalSubmitBtn}>
                  Publish to Feed
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderNotificationsModal()}
      {renderNetworkModal('followers')}
      {renderNetworkModal('following')}

      {/* Quick Access Panel – right side on desktop, bottom on mobile */}
      <QuickAccessPanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpload={() => setIsUploadOpen(true)}
        pendingRequestsCount={requests.length}
        onNotificationsOpen={() => setIsNotificationsOpen(true)}
      />
    </div>
  );
}

const styles = {
  feedWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#0a0a0a',
  },
  scrollContainer: {
    height: '100%',
    width: '100%',
  },
  feedHeaderBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.6) 70%, rgba(10, 10, 10, 0) 100%)',
    paddingBottom: '16px',
    zIndex: 20,
    overflow: 'hidden',
  },
  logoSearchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px 4px 16px',
    height: '48px',
  },
  logoIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(45deg, #6c63ff, #ff4757)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  topSearchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '6px 12px',
    width: '150px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
  },
  topSearchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '12px',
    width: '100%',
  },
  categoryPillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '6px 16px 4px 16px',
  },
  pillRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    whiteSpace: 'nowrap',
  },
  categoryPill: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  mainContentContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: '56px',
  },
  emptyContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '240px',
    lineHeight: 1.5,
    marginBottom: '20px',
  },
  exploreBtn: {
    backgroundColor: '#6c63ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
  },
  profileView: {
    flex: 1,
    height: 'calc(100% - 56px)',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  igHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px 8px 16px',
    backgroundColor: '#000000',
    borderBottom: '1px solid #121212',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  igHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
  },
  igUsername: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
  },
  igHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  igHeaderBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igProfileInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    gap: '24px',
    flexShrink: 0,
  },
  igAvatarWrapper: {
    flexShrink: 0,
  },
  igAvatarGradient: {
    padding: '2.5px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatarImg: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    border: '3px solid #000000',
    objectFit: 'cover',
  },
  igStatsContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  igStatCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  igStatNum: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
  },
  igStatLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: '2px',
  },
  igBioContainer: {
    padding: '0 16px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  igDisplayName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '2px',
  },
  igCategory: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: '4px',
  },
  igBioText: {
    fontSize: '12px',
    color: '#ffffff',
    lineHeight: 1.4,
    whiteSpace: 'pre-line',
  },
  igBioLink: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#0095f6',
    textDecoration: 'none',
    fontWeight: '500',
    marginTop: '6px',
  },
  igActionsRow: {
    display: 'flex',
    padding: '0 16px 16px 16px',
    gap: '8px',
    width: '100%',
    flexShrink: 0,
  },
  igActionButton: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 0',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
  },
  igActionIconBtn: {
    width: '32px',
    height: '30px',
    backgroundColor: '#1c1c1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    outline: 'none',
  },
  igHighlightsScroll: {
    display: 'flex',
    gap: '18px',
    overflowX: 'auto',
    padding: '0 16px 16px 16px',
    scrollbarWidth: 'none',
    borderBottom: '1px solid #121212',
    flexShrink: 0,
  },
  igHighlightItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  igHighlightCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#121212',
    border: '1px solid #262626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  igHighlightLabel: {
    fontSize: '10px',
    color: '#ffffff',
    fontWeight: '400',
  },
  igTabsRow: {
    display: 'flex',
    borderBottom: '1px solid #121212',
    backgroundColor: '#000000',
    flexShrink: 0,
  },
  igTabButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '12px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'color 0.2s, border-top 0.2s',
  },
  igMediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5px',
    paddingBottom: '24px',
    backgroundColor: '#000000',
  },
  igEmptyGrid: {
    padding: '48px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  igEmptyGridText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
    fontWeight: '500',
  },
  headerUploadBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
  },
  modalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    padding: '20px',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 1,
  },
  modalContent: {
    width: '100%',
    maxWidth: '380px',
    maxHeight: '100%',
    overflowY: 'auto',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalFieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  modalInput: {
    backgroundColor: '#282828',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
  },
  modalTextarea: {
    backgroundColor: '#282828',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
    resize: 'none',
  },
  modalSelect: {
    backgroundColor: '#282828',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    padding: '10px 12px',
    outline: 'none',
  },
  modalHelperText: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 1.3,
  },
  modalSubmitBtn: {
    background: 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)',
  },
  exploreView: {
    flex: 1,
    height: 'calc(100% - 56px)',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingBottom: '24px',
  },
  exploreHeader: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'sticky',
    top: 0,
    backgroundColor: '#000000',
    zIndex: 10,
  },
  exploreTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
  },
  exploreSearchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '10px 14px',
  },
  exploreSearchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '13px',
    width: '100%',
  },
  exploreCategoriesScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '0 16px 16px 16px',
    scrollbarWidth: 'none',
    borderBottom: '1px solid #121212',
    flexShrink: 0,
  },
  exploreCategoryBtn: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  exploreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#000000',
  },
  exploreEmpty: {
    padding: '48px 16px',
    textAlign: 'center',
  },
};
