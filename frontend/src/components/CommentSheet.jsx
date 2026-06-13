import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function CommentSheet({ isOpen, onClose, comments = [], onAddComment }) {
  const [inputText, setInputText] = useState('');
  const user = useSelector((state) => state.auth.user);
  const scrollRef = useRef(null);

  // Auto scroll to bottom of comments when a new one is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments.length, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(inputText.trim());
    setInputText('');
  };

  const currentUserAvatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ bottom: 0.1, top: 0.05 }}
            onDragEnd={(event, info) => {
              // Dismiss sheet if dragged down significantly
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            style={styles.sheet}
          >
            {/* Drag Handle */}
            <div style={styles.dragHandleWrapper}>
              <div style={styles.dragHandle} />
            </div>

            {/* Header */}
            <div style={styles.header}>
              <h3 style={styles.heading}>{comments.length} comments</h3>
              <button onClick={onClose} style={styles.closeBtn}>
                <X size={18} color="#aaa" />
              </button>
            </div>

            {/* Comments List */}
            <div ref={scrollRef} style={styles.commentList} className="comment-list-scroll">
              {comments.length === 0 ? (
                <div style={styles.emptyState}>No comments yet. Start the learning discussion!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} style={styles.commentItem}>
                    <img
                      src={comment.avatar}
                      alt={comment.username}
                      style={styles.avatar}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div style={styles.commentContent}>
                      <div style={styles.commentMeta}>
                        <span style={styles.username}>{comment.username}</span>
                        <span style={styles.timestamp}>{comment.timestamp || 'now'}</span>
                      </div>
                      <p style={styles.commentText}>{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={styles.inputRow}>
              <img
                src={currentUserAvatar}
                alt="Me"
                style={styles.inputAvatar}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';
                }}
              />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Add a comment..."
                style={styles.inputField}
              />
              <button type="submit" disabled={!inputText.trim()} style={styles.sendBtn}>
                <Send size={14} color="#fff" />
              </button>
            </form>
          </motion.div>

          {/* Hide list scrollbar utility styling */}
          <style>{`
            .comment-list-scroll::-webkit-scrollbar {
              display: none;
            }
            .comment-list-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 200,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    maxHeight: '70vh',
    minHeight: '40vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 210,
    paddingBottom: 'env(safe-area-inset-bottom, 12px)',
  },
  dragHandleWrapper: {
    width: '100%',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'grab',
  },
  dragHandle: {
    width: '32px',
    height: '3px',
    backgroundColor: '#444444',
    borderRadius: '1.5px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px 12px 16px',
    borderBottom: '1px solid #282828',
  },
  heading: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    outline: 'none',
  },
  commentList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '12px',
    padding: '30px 10px',
  },
  commentItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  username: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  commentText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 1.3,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #282828',
    backgroundColor: '#1a1a1a',
  },
  inputAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#282828',
    border: 'none',
    borderRadius: '20px',
    color: '#ffffff',
    fontSize: '12px',
    padding: '8px 14px',
    outline: 'none',
  },
  sendBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#6c63ff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
  },
};
