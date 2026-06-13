import React from 'react';
import { Home, Compass, User } from 'lucide-react';

export default function NavBar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="app-navbar" style={styles.navBar}>
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              ...styles.navItem,
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <IconComponent size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={styles.navLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  navBar: {
    height: '56px',
    backgroundColor: '#0a0a0a',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    flex: 1,
    height: '100%',
    outline: 'none',
    transition: 'color 0.2s ease, transform 0.1s ease',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '500',
  },
};
