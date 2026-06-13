import React from 'react';

export default function Skeleton() {
  return (
    <div style={styles.container} className="skeleton-pulse">
      {/* Top Section */}
      <div style={styles.topSection}>
        <div style={styles.titleSkeleton} />
        <div style={styles.searchSkeleton} />
      </div>

      {/* Right Action Buttons Skeleton */}
      <div style={styles.rightActions}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={styles.actionItem}>
            <div style={styles.circleSkeleton} />
            {i < 5 && <div style={styles.labelSkeleton} />}
          </div>
        ))}
      </div>

      {/* Bottom Info Skeleton */}
      <div style={styles.bottomInfo}>
        <div style={styles.categoryPillSkeleton} />
        <div style={styles.rowSkeleton}>
          <div style={styles.avatarSkeleton} />
          <div style={styles.usernameSkeleton} />
        </div>
        <div style={styles.titleTextSkeleton} />
        <div style={styles.descSkeleton1} />
        <div style={styles.descSkeleton2} />
      </div>

      {/* Add keyframe style tag inside React for self-containment */}
      <style>{`
        .skeleton-pulse {
          animation: skeleton-pulse-keyframes 1.5s ease-in-out infinite;
        }
        @keyframes skeleton-pulse-keyframes {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
    marginTop: '20px',
  },
  titleSkeleton: {
    width: '80px',
    height: '24px',
    backgroundColor: '#222',
    borderRadius: '4px',
  },
  searchSkeleton: {
    width: '28px',
    height: '28px',
    backgroundColor: '#222',
    borderRadius: '50%',
  },
  rightActions: {
    position: 'absolute',
    right: '12px',
    bottom: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
  },
  actionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  circleSkeleton: {
    width: '40px',
    height: '40px',
    backgroundColor: '#222',
    borderRadius: '50%',
  },
  labelSkeleton: {
    width: '24px',
    height: '10px',
    backgroundColor: '#222',
    borderRadius: '2px',
  },
  bottomInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '60px',
    width: '75%',
  },
  categoryPillSkeleton: {
    width: '70px',
    height: '18px',
    backgroundColor: '#222',
    borderRadius: '100px',
  },
  rowSkeleton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatarSkeleton: {
    width: '28px',
    height: '28px',
    backgroundColor: '#222',
    borderRadius: '50%',
  },
  usernameSkeleton: {
    width: '90px',
    height: '14px',
    backgroundColor: '#222',
    borderRadius: '4px',
  },
  titleTextSkeleton: {
    width: '180px',
    height: '16px',
    backgroundColor: '#222',
    borderRadius: '4px',
    marginTop: '4px',
  },
  descSkeleton1: {
    width: '100%',
    height: '12px',
    backgroundColor: '#222',
    borderRadius: '4px',
  },
  descSkeleton2: {
    width: '80%',
    height: '12px',
    backgroundColor: '#222',
    borderRadius: '4px',
  },
};
