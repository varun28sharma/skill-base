import React from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActionButtons({
  videoId,
  likesCount = 0,
  commentsCount = 0,
  isLiked = false,
  isBookmarked = false,
  onLikeToggle,
  onBookmarkToggle,
  onCommentClick,
  creatorAvatar,
}) {
  // Simple format function (e.g. 1542 -> 1.5K)
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/video/${videoId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Short Learn Video',
        text: 'Check out this awesome educational short video!',
        url: shareUrl,
      }).catch((err) => console.log('Share canceled', err));
    } else {
      // Fallback
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div style={styles.actionsColumn}>
      {/* 1. Like Button */}
      <div style={styles.actionItem}>
        <motion.button
          onClick={onLikeToggle}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          style={{
            ...styles.circleButton,
            backgroundColor: isLiked ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255, 255, 255, 0.15)',
          }}
        >
          <Heart
            size={22}
            color={isLiked ? '#ff4757' : '#ffffff'}
            fill={isLiked ? '#ff4757' : 'none'}
            strokeWidth={2}
          />
        </motion.button>
        <span style={styles.label}>{formatNumber(likesCount)}</span>
      </div>

      {/* 2. Comment Button */}
      <div style={styles.actionItem}>
        <motion.button
          onClick={onCommentClick}
          whileTap={{ scale: 1.2 }}
          style={styles.circleButton}
        >
          <MessageCircle size={22} color="#ffffff" strokeWidth={2} />
        </motion.button>
        <span style={styles.label}>{formatNumber(commentsCount)}</span>
      </div>

      {/* 3. Bookmark Button */}
      <div style={styles.actionItem}>
        <motion.button
          onClick={onBookmarkToggle}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          style={{
            ...styles.circleButton,
            backgroundColor: isBookmarked ? 'rgba(108, 99, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
          }}
        >
          <Bookmark
            size={22}
            color={isBookmarked ? '#6c63ff' : '#ffffff'}
            fill={isBookmarked ? '#6c63ff' : 'none'}
            strokeWidth={2}
          />
        </motion.button>
        <span style={styles.label}>{isBookmarked ? 'Saved' : 'Save'}</span>
      </div>

      {/* 4. Share/Direct Button */}
      <div style={styles.actionItem}>
        <motion.button
          onClick={handleShareClick}
          whileTap={{ scale: 1.2 }}
          style={styles.circleButton}
        >
          <Send size={20} color="#ffffff" strokeWidth={2} style={{ transform: 'rotate(-25deg)', marginLeft: '2px', marginTop: '-1px' }} />
        </motion.button>
        <span style={styles.label}>Share</span>
      </div>
    </div>
  );
}

const styles = {
  actionsColumn: {
    position: 'absolute',
    right: '12px',
    bottom: '60px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    alignItems: 'center',
    zIndex: 100,
  },
  actionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  circleButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    color: '#ffffff',
    backdropFilter: 'blur(4px)',
    transition: 'background-color 0.2s',
  },
  label: {
    fontSize: '10px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)',
  },
  profileOuter: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
    overflow: 'hidden',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.5)',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};
