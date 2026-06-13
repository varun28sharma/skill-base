import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  User,
  UploadCloud,
  Bell,
  Play,
  Search,
} from 'lucide-react';

/**
 * QuickAccessPanel
 * Desktop: fixed pill panel to the right of the app shell
 * Mobile: fixed floating bar at the bottom of the viewport
 */
export default function QuickAccessPanel({
  activeTab,
  setActiveTab,
  onUpload,
  pendingRequestsCount = 0,
  onNotificationsOpen,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'explore', label: 'Explore', Icon: Compass },
    { id: 'profile', label: 'Profile', Icon: User },
  ];

  const actionItems = [
    {
      id: 'upload',
      label: 'Upload',
      Icon: UploadCloud,
      onClick: onUpload,
      accent: true,
    },
    {
      id: 'notifications',
      label: 'Alerts',
      Icon: Bell,
      onClick: onNotificationsOpen,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
  ];

  return (
    <>
      {/* ── Desktop Quick Panel (right side) ── */}
      <div className="qap-desktop">
        <div className="qap-desktop-inner">
          {/* Brand mark */}
          <div className="qap-brand">
            <div className="qap-brand-icon">
              <Play size={10} color="#ffffff" fill="#ffffff" />
            </div>
          </div>

          <div className="qap-divider" />

          {/* Nav items */}
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <div key={id} className="qap-item-wrap">
                <motion.button
                  className={`qap-btn ${isActive ? 'qap-btn--active' : ''}`}
                  onClick={() => setActiveTab(id)}
                  onHoverStart={() => setHoveredItem(id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  title={label}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.button>
                <AnimatePresence>
                  {hoveredItem === id && (
                    <motion.div
                      className="qap-tooltip"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="qap-divider" />

          {/* Action items */}
          {actionItems.map(({ id, label, Icon, onClick, accent, badge }) => (
            <div key={id} className="qap-item-wrap">
              <motion.button
                className={`qap-btn ${accent ? 'qap-btn--accent' : ''}`}
                onClick={onClick}
                onHoverStart={() => setHoveredItem(id)}
                onHoverEnd={() => setHoveredItem(null)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                title={label}
              >
                <Icon size={18} strokeWidth={1.8} />
                {badge != null && (
                  <span className="qap-badge">{badge > 9 ? '9+' : badge}</span>
                )}
              </motion.button>
              <AnimatePresence>
                {hoveredItem === id && (
                  <motion.div
                    className="qap-tooltip"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Floating Bottom Bar ── */}
      <div className="qap-mobile">
        <div className="qap-mobile-inner">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <motion.button
                key={id}
                className={`qap-mobile-btn ${isActive ? 'qap-mobile-btn--active' : ''}`}
                onClick={() => setActiveTab(id)}
                whileTap={{ scale: 0.88 }}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="qap-mobile-label">{label}</span>
              </motion.button>
            );
          })}

          {/* Upload pill */}
          <motion.button
            className="qap-mobile-btn qap-mobile-btn--upload"
            onClick={onUpload}
            whileTap={{ scale: 0.88 }}
          >
            <UploadCloud size={19} strokeWidth={1.8} />
            <span className="qap-mobile-label">Upload</span>
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="qap-mobile-btn"
            onClick={onNotificationsOpen}
            whileTap={{ scale: 0.88 }}
            style={{ position: 'relative' }}
          >
            <Bell size={19} strokeWidth={1.8} />
            {pendingRequestsCount > 0 && (
              <span className="qap-badge qap-badge--mobile">
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </span>
            )}
            <span className="qap-mobile-label">Alerts</span>
          </motion.button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* ===== DESKTOP PANEL ===== */
        .qap-desktop {
          display: none;
          position: fixed;
          /* Sit just to the right of the 430px app shell (centred in viewport) */
          left: calc(50% + 215px + 16px);
          top: 50%;
          transform: translateY(-50%);
          z-index: 9999;
        }

        @media (min-width: 600px) {
          .qap-desktop { display: flex; }
        }

        .qap-desktop-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: rgba(18, 18, 22, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 14px 10px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(108, 99, 255, 0.06) inset;
        }

        .qap-brand {
          margin-bottom: 4px;
        }

        .qap-brand-icon {
          width: 28px;
          height: 28px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6c63ff 0%, #ff4757 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(108, 99, 255, 0.35);
        }

        .qap-divider {
          width: 20px;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 4px 0;
        }

        .qap-item-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .qap-btn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: background 0.18s ease, color 0.18s ease;
          position: relative;
        }

        .qap-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .qap-btn--active {
          background: rgba(108, 99, 255, 0.18);
          color: #a89dff;
        }

        .qap-btn--active:hover {
          background: rgba(108, 99, 255, 0.25);
          color: #c4baff;
        }

        .qap-btn--accent {
          background: rgba(108, 99, 255, 0.14);
          color: #a89dff;
          border: 1px solid rgba(108, 99, 255, 0.22);
        }

        .qap-btn--accent:hover {
          background: rgba(108, 99, 255, 0.28);
          color: #ffffff;
        }

        .qap-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          min-width: 14px;
          height: 14px;
          border-radius: 7px;
          background: #ff4757;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 1.5px solid rgba(18, 18, 22, 0.9);
          pointer-events: none;
        }

        .qap-tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(30, 30, 38, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
          pointer-events: none;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .qap-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: rgba(255, 255, 255, 0.1);
        }

        /* ===== MOBILE FLOATING BAR ===== */
        .qap-mobile {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          justify-content: center;
          padding: 0 8px env(safe-area-inset-bottom, 0);
          pointer-events: none;
        }

        @media (min-width: 600px) {
          .qap-mobile { display: none; }
        }

        .qap-mobile-inner {
          pointer-events: all;
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(14, 14, 18, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 0;
          padding: 6px 8px;
          width: 100%;
          max-width: 430px;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.4);
        }

        .qap-mobile-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          outline: none;
          padding: 6px 4px;
          border-radius: 12px;
          transition: color 0.18s ease, background 0.18s ease;
          position: relative;
        }

        .qap-mobile-btn--active {
          color: #ffffff;
        }

        .qap-mobile-btn--upload {
          color: #a89dff;
        }

        .qap-mobile-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        .qap-badge--mobile {
          top: 3px;
          right: 12px;
        }
      `}</style>
    </>
  );
}
