import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos, setCurrentIndex, createVideo } from '../redux/videosSlice';
import VideoCard from '../components/VideoCard';
import NavBar from '../components/NavBar';
import Skeleton from '../components/Skeleton';
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
  X
} from 'lucide-react';

export default function Feed() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'saved' | 'profile'
  const [profileActiveTab, setProfileActiveTab] = useState('grid'); // 'grid' | 'reels' | 'saved'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('German');
  const [uploadFilePath, setUploadFilePath] = useState('/uploads/Introduction_German.mp4');

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadDesc.trim()) return;

    dispatch(createVideo({
      title: uploadTitle.trim(),
      description: uploadDesc.trim(),
      category: uploadCategory,
      file_path: uploadFilePath
    }))
      .unwrap()
      .then(() => {
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadDesc('');
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

  useEffect(() => {
    // Fetch videos if not loaded
    if (videos.length === 0) {
      dispatch(fetchVideos());
    }
  }, [dispatch, videos.length]);

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
    if (activeTab === 'saved') {
      list = videos.filter((v) => !!bookmarkedVideos[v.id]);
    }

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
          v.description.toLowerCase().includes(q)
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
      case 'saved':
        if (displayVideos.length === 0) {
          return (
            <div style={styles.emptyContainer}>
              <Bookmark size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>
                {activeTab === 'saved' ? 'No Saved Lessons' : 'No lessons found'}
              </h3>
              <p style={styles.emptyDesc}>
                {activeTab === 'saved'
                  ? 'Bookmark vertical learning shorts to review them here later.'
                  : 'Check back later for new uploads.'}
              </p>
              {activeTab === 'saved' && (
                <button onClick={() => setActiveTab('home')} style={styles.exploreBtn}>
                  Browse Home Feed
                </button>
              )}
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

      case 'profile': {
        const savedCount = Object.keys(bookmarkedVideos).length;
        const profileVideos = profileActiveTab === 'saved'
          ? videos.filter((v) => !!bookmarkedVideos[v.id])
          : videos;

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
                  {user?.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'developer_learner'}
                </span>
                <ChevronDown size={12} color="#ffffff" style={{ marginLeft: '4px' }} />
              </div>
              <div style={styles.igHeaderRight}>
                <button style={styles.igHeaderBtn} onClick={() => setIsUploadOpen(true)}>
                  <Plus size={20} color="#ffffff" />
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
                <div style={styles.igStatCol} onClick={() => setProfileActiveTab('saved')}>
                  <span style={styles.igStatNum}>{savedCount}</span>
                  <span style={styles.igStatLabel}>Saved</span>
                </div>
                <div style={styles.igStatCol}>
                  <span style={styles.igStatNum}>{savedCount * 50 + 100}</span>
                  <span style={styles.igStatLabel}>XP</span>
                </div>
              </div>
            </div>

            {/* Bio Block */}
            <div style={styles.igBioContainer}>
              <h3 style={styles.igDisplayName}>{user?.name || 'Developer Learner'}</h3>
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
              <div style={styles.igHighlightItem} onClick={() => alert('XP Milestone Highlights')}>
                <div style={styles.igHighlightCircle}>
                  <Award size={18} color="#ffffff" />
                </div>
                <span style={styles.igHighlightLabel}>XP</span>
              </div>
              <div style={styles.igHighlightItem} onClick={() => setActiveTab('explore')}>
                <div style={styles.igHighlightCircle}>
                  <Search size={18} color="#ffffff" />
                </div>
                <span style={styles.igHighlightLabel}>Explore</span>
              </div>
              <div style={styles.igHighlightItem} onClick={() => alert('Bookmarks collection')}>
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
              <div style={styles.igEmptyGrid}>
                <span style={styles.igEmptyGridText}>
                  {profileActiveTab === 'saved' ? 'No Saved Items' : 'No posts yet'}
                </span>
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

  const showHeader = activeTab === 'home' || activeTab === 'saved';

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
      <div style={styles.mainContentContainer}>
        {renderContent()}
      </div>

      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {isUploadOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadOpen(false)}
              style={styles.modalBackdrop}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
                  <select
                    value={uploadFilePath}
                    onChange={(e) => setUploadFilePath(e.target.value)}
                    style={styles.modalSelect}
                  >
                    <option value="/uploads/Introduction_German.mp4">Introduction_German.mp4</option>
                    <option value="/uploads/Learning_German.mp4">Learning_German.mp4</option>
                    <option value="/uploads/Story_German.mp4">Story_German.mp4</option>
                  </select>
                  <span style={styles.modalHelperText}>
                    Selects one of the physical media files located inside backend/uploads/ folder.
                  </span>
                </div>

                <button type="submit" style={styles.modalSubmitBtn}>
                  Publish to Feed
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 300,
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% - 40px)',
    maxWidth: '380px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 310,
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
};
