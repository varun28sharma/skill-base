import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Volume2, VolumeX, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import useInView from '../hooks/useInView';
import ActionButtons from './ActionButtons';
import CommentSheet from './CommentSheet';
import { toggleLikeVideo, toggleBookmarkVideo } from '../redux/interactionsSlice';
import { addComment } from '../redux/videosSlice';
import { toggleFollowUser } from '../redux/networkSlice';

export default function VideoCard({ video, isActiveCard }) {
  const videoRef = useRef(null);
  const [containerRef, isInView] = useInView({ threshold: 0.6 });
  
  const dispatch = useDispatch();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayIndicator, setShowPlayIndicator] = useState(null); // 'play' | 'pause' | null
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  // Redux state
  const likedVideos = useSelector((state) => state.interactions.likedVideos);
  const bookmarkedVideos = useSelector((state) => state.interactions.bookmarkedVideos);
  const followStatuses = useSelector((state) => state.network.followStatuses);
  const currentUser = useSelector((state) => state.auth.user);

  const isLiked = !!likedVideos[video.id];
  const isBookmarked = !!bookmarkedVideos[video.id];

  // Resolve creator follow status
  const followStatus = followStatuses[video.creator?.id] || (video.creator?.isFollowing === 'requested' ? 'requested' : (video.creator?.isFollowing === true ? 'following' : 'none'));
  const isFollowing = followStatus === 'following';
  const isRequested = followStatus === 'requested';

  const isOwnVideo = currentUser && video.creator && currentUser.id === video.creator.id;

  // Handle Autoplay via hook and active card prop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isInView && isActiveCard) {
      videoElement.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log('Autoplay blocked or interrupted:', err);
          setIsPlaying(false);
        });
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isInView, isActiveCard]);

  // Handle progress bar update
  const handleTimeUpdate = () => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.duration) {
      const pct = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(pct);
    }
  };

  // Toggle Play / Pause on tap
  const handleVideoTap = (e) => {
    // Avoid triggering when tapping overlays
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('form')) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
      setShowPlayIndicator('pause');
    } else {
      videoElement.play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayIndicator('play');
        })
        .catch((err) => console.log(err));
    }

    // Clear indicator after 800ms
    setTimeout(() => {
      setShowPlayIndicator(null);
    }, 800);
  };

  // Toggle Mute
  const handleVolumeToggle = (e) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setIsMuted(videoElement.muted);
    }
  };

  // Interactions
  const handleLikeToggle = () => {
    dispatch(toggleLikeVideo(video.id));
  };

  const handleBookmarkToggle = () => {
    dispatch(toggleBookmarkVideo(video.id));
  };

  const handleAddCommentSubmit = (text) => {
    dispatch(addComment({ videoId: video.id, text }));
  };

  return (
    <div ref={containerRef} className="video-card-snap" style={styles.cardContainer}>
      
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.url}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoTap}
        onTimeUpdate={handleTimeUpdate}
        style={styles.videoPlayer}
      />

      {/* Top Gradient Overlay (Hidden due to unified header) */}
      {false && (
        <div style={styles.topOverlay} className="gradient-overlay-top">
          <div style={styles.headerRow}>
            <span style={styles.headerTitle}>Shorts</span>
            <button style={styles.iconBtn}>
              <Search size={20} color="#ffffff" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Gradient Overlay */}
      <div style={styles.bottomOverlay} className="gradient-overlay-bottom">
        <div style={styles.infoWrapper}>
          
          {/* Category pill */}
          <div style={styles.categoryPill}>{video.category}</div>

          {/* User metadata */}
          <div style={styles.userRow}>
            <img
              src={video.creator.avatar}
              alt={video.creator.name}
              style={styles.creatorAvatar}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60';
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}>{video.creator.name}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)' }}>@{video.creator.username}</span>
            </div>
            {!isOwnVideo && (
              <button
                onClick={() => dispatch(toggleFollowUser(video.creator?.id))}
                style={{
                  ...styles.followBtn,
                  borderColor: isFollowing ? 'rgba(255,255,255,0.3)' : (isRequested ? 'rgba(255,255,255,0.2)' : '#6c63ff'),
                  backgroundColor: isFollowing ? 'transparent' : (isRequested ? 'rgba(255,255,255,0.05)' : 'rgba(108, 99, 255, 0.1)'),
                  color: isFollowing ? 'rgba(255,255,255,0.6)' : (isRequested ? 'rgba(255,255,255,0.5)' : '#ffffff'),
                }}
              >
                {!isFollowing && !isRequested && <Plus size={10} style={{ marginRight: '2px' }} />}
                {isFollowing ? 'Following' : (isRequested ? 'Requested' : 'Follow')}
              </button>
            )}
          </div>

          {/* Video Title & Description */}
          <h4 style={styles.titleText}>{video.title}</h4>
          <p style={styles.descText}>{video.description}</p>

          {/* Audio Track marquee with Rotating Disk */}
          <div style={styles.audioRow}>
            <div style={styles.marqueeContainer}>
              <div style={styles.marqueeText} className="marquee-animation">
                🎵 {video.music || 'Original Audio'} &nbsp;&bull;&nbsp; {video.music || 'Original Audio'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Overlay (Action column) */}
      <ActionButtons
        videoId={video.id}
        likesCount={video.likesCount}
        commentsCount={video.commentsCount}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLikeToggle={handleLikeToggle}
        onBookmarkToggle={handleBookmarkToggle}
        onCommentClick={() => setIsCommentOpen(true)}
        creatorAvatar={video.creator.avatar}
      />

      {/* Floating Sound Toggle */}
      <button onClick={handleVolumeToggle} style={styles.volumeBtn}>
        {isMuted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
      </button>

      {/* Rotating Music Disc Bottom Right */}
      <div style={styles.musicDiscWrapper}>
        <div style={{ ...styles.musicDisc, animationPlayState: isPlaying ? 'running' : 'paused' }}>
          <img
            src={video.creator.avatar}
            alt="music cover"
            style={styles.discImg}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60';
            }}
          />
        </div>
      </div>

      {/* Progress Bar at the very bottom */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Central Play/Pause Tap Feedback Overlay */}
      <AnimatePresence>
        {showPlayIndicator && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.9 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={styles.indicatorContainer}
          >
            <div style={styles.indicatorCircle}>
              {showPlayIndicator === 'play' ? (
                <Play size={28} color="#fff" fill="#fff" />
              ) : (
                <Pause size={28} color="#fff" fill="#fff" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment bottom sheet overlay */}
      <CommentSheet
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        comments={video.comments}
        onAddComment={handleAddCommentSubmit}
      />

      {/* Scrolling marquee keyframes */}
      <style>{`
        .marquee-animation {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marquee-scroll-keyframes 12s linear infinite;
        }
        @keyframes marquee-scroll-keyframes {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  cardContainer: {
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    userSelect: 'none',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    zIndex: 20,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: '10px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: '4px', // Positioned right above the progress bar line at the bottom
    left: 0,
    right: 0,
    padding: '20px 70px 8px 16px', // Clean compact padding
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  infoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start',
  },
  categoryPill: {
    fontSize: '10px',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '100px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  creatorAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.3)',
    objectFit: 'cover',
  },
  username: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    textShadow: '0px 1px 3px rgba(0, 0, 0, 0.8)',
  },
  followBtn: {
    fontSize: '10px',
    fontWeight: '600',
    border: '1px solid',
    borderRadius: '4px',
    padding: '2px 8px',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  titleText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.3,
    textShadow: '0px 1px 3px rgba(0, 0, 0, 0.8)',
  },
  descText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textShadow: '0px 1px 4px rgba(0, 0, 0, 0.8)',
  },
  audioRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  marqueeContainer: {
    width: '130px',
    overflow: 'hidden',
  },
  marqueeText: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  volumeBtn: {
    position: 'absolute',
    top: '144px',
    right: '20px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    outline: 'none',
  },
  musicDiscWrapper: {
    position: 'absolute',
    right: '16px',
    bottom: '10px', // Lowered closer to bottom to align with sound marquee
    zIndex: 100,
  },
  musicDisc: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#111111',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spin 4s linear infinite',
  },
  discImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0, // Lowered to the very bottom of the card
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 101,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    transition: 'width 0.1s linear',
  },
  indicatorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 100,
    pointerEvents: 'none',
  },
  indicatorCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
