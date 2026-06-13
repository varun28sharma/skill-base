import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { login, clearError, loginWithGoogle } from '../redux/authSlice';

/* Floating lesson card data for the left panel */
const floatingCards = [
  {
    id: 1,
    emoji: '🇩🇪',
    title: 'German Basics',
    creator: '@german_native',
    accentColor: 'rgba(108, 99, 255, 0.35)',
    rotate: '-7deg',
    top: '42%',
    left: '4%',
  },
  {
    id: 2,
    emoji: '⚛️',
    title: 'React Hooks',
    creator: '@react_wizard',
    accentColor: 'rgba(56, 189, 248, 0.35)',
    rotate: '5deg',
    top: '38%',
    left: '44%',
  },
  {
    id: 3,
    emoji: '🤖',
    title: 'AI Fundamentals',
    creator: '@ai_researcher',
    accentColor: 'rgba(52, 211, 153, 0.3)',
    rotate: '-4deg',
    top: '64%',
    left: '10%',
  },
  {
    id: 4,
    emoji: '📊',
    title: 'DSA Patterns',
    creator: '@dsa_mentor',
    accentColor: 'rgba(251, 146, 60, 0.3)',
    rotate: '4deg',
    top: '62%',
    left: '50%',
  },
];

function FloatingCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: card.rotate }}
      animate={{ opacity: 1, y: 0, rotate: card.rotate }}
      transition={{ delay: 0.4 + index * 0.18, duration: 0.7, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: card.top,
        left: card.left,
        /* ── Glassmorphism ── */
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '14px 18px',
        minWidth: '158px',
        boxShadow: [
          '0 8px 32px rgba(0, 0, 0, 0.45)',
          `0 0 0 1px ${card.accentColor}`,
          `inset 0 1px 0 rgba(255,255,255,0.08)`,
        ].join(', '),
        cursor: 'default',
        zIndex: 1,
      }}
    >
      {/* Accent glow blob behind card */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '16px',
        background: `radial-gradient(ellipse at 30% 30%, ${card.accentColor} 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Card content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '24px', marginBottom: '7px', lineHeight: 1 }}>{card.emoji}</div>
        <div style={{
          fontSize: '13px', fontWeight: '700', color: '#fff',
          marginBottom: '3px', letterSpacing: '-0.2px',
        }}>
          {card.title}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
          {card.creator}
        </div>
        {/* Progress / live bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <div style={{
            height: '2px', flex: 1,
            background: `linear-gradient(90deg, ${card.accentColor.replace('0.3', '0.9').replace('0.35', '0.9')}, transparent)`,
            borderRadius: '2px',
          }} />
          <span style={{
            fontSize: '8px', color: 'rgba(255,255,255,0.35)',
            fontWeight: '700', letterSpacing: '0.4px',
          }}>● LIVE</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleGoogleSignIn = () => {
    dispatch(loginWithGoogle());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(login({ email, password }));
  };

  return (
    <div style={S.page}>
      {/* ── LEFT: Visual Brand Panel ── */}
      <div style={S.leftPanel}>
        {/* Subtle gradient noise overlay */}
        <div style={S.leftOverlay} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={S.brandRow}
        >
          <div style={S.logoIcon}>
            <Play size={12} color="#fff" fill="#fff" style={{ marginLeft: '1px' }} />
          </div>
          <span style={S.brandName}>Skillbase</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={S.headline}
        >
          <h1 style={S.headlineH1}>
            Learn from the world's{' '}
            <span style={S.headlineAccent}>best creators.</span>
          </h1>
          <p style={S.headlineSub}>
            Short-form lessons. Real skills. Your pace.
          </p>
        </motion.div>

        {/* Hero image – the main visual between headline and stats */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
          style={S.heroImageWrap}
        >
          <img
            src="/login_hero.png"
            alt="Students learning languages and coding"
            style={S.heroImage}
            draggable={false}
          />
          {/* Glow behind the image */}
          <div style={S.heroGlow} />

          {/* Small floating badge overlays on the image */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ ...S.heroBadge, bottom: '18%', left: '-12px' }}
          >
            <span style={{ fontSize: '14px' }}>🇩🇪</span>
            <span style={S.heroBadgeText}>German Basics</span>
            <span style={S.heroBadgeLive}>● LIVE</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            style={{ ...S.heroBadge, top: '12%', right: '-12px' }}
          >
            <span style={{ fontSize: '14px' }}>⚛️</span>
            <span style={S.heroBadgeText}>React Hooks</span>
            <span style={{ ...S.heroBadgeLive, background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>↑ Trending</span>
          </motion.div>
        </motion.div>

        {/* Bottom stat bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={S.statsRow}
        >
          {[['12K+', 'Lessons'], ['4.8K', 'Creators'], ['98%', 'Satisfaction']].map(([val, label]) => (
            <div key={label} style={S.statItem}>
              <span style={S.statVal}>{val}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT: Login Form Panel ── */}
      <div style={S.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={S.formCard}
        >
          <p style={S.formHeadingSmall}>Log in to Skillbase</p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={S.errorBox}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Email */}
            <div style={{
              ...S.inputWrap,
              borderColor: focusedField === 'email' ? '#4a90e2' : 'rgba(255,255,255,0.12)',
              boxShadow: focusedField === 'email' ? '0 0 0 1px #4a90e2' : 'none',
            }}>
              <input
                type="email"
                placeholder="Email address or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                disabled={loading}
                style={S.input}
              />
            </div>

            {/* Password */}
            <div style={{
              ...S.inputWrap,
              borderColor: focusedField === 'password' ? '#4a90e2' : 'rgba(255,255,255,0.12)',
              boxShadow: focusedField === 'password' ? '0 0 0 1px #4a90e2' : 'none',
            }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                disabled={loading}
                style={S.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              style={{
                ...S.loginBtn,
                opacity: loading || !email || !password ? 0.55 : 1,
                cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <Loader size={15} className="animate-spin" /> : 'Log in'}
            </button>
          </form>

          <p style={S.forgotLink}>
            <a href="#" style={S.linkText}>Forgotten password?</a>
          </p>

          {/* Divider */}
          <div style={S.divider}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>or</span>
            <div style={S.dividerLine} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={S.googleBtn}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
              <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.309 2.69 1.255 6.627l4.01 3.138z" />
              <path fill="#34a853" d="M16.04 15.341c-1.07.727-2.437 1.159-4.04 1.159a7.07 7.07 0 0 1-6.734-4.856L1.256 14.78C3.31 18.718 7.355 21.4 12 21.4c3.09 0 5.864-1.018 7.827-2.773l-3.787-3.286z" />
              <path fill="#4285f4" d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.473a5.533 5.533 0 0 1-2.4 3.627l3.787 3.286c2.213-2.036 3.63-5.036 3.63-8.77l.001-.27z" />
              <path fill="#fbbc05" d="M5.266 14.235A7.02 7.02 0 0 1 4.909 12c0-.791.136-1.555.357-2.264L1.256 6.627A11.917 11.917 0 0 0 0 12c0 1.927.455 3.745 1.255 5.373l4.011-3.138z" />
            </svg>
            Continue with Google
          </button>

          {/* Create account */}
          <Link to="/register" style={S.createAccountBtn}>
            Create new account
          </Link>

          <p style={S.metaText}>
            <span style={{ opacity: 0.4 }}>Skillbase · </span>
            <span style={{ opacity: 0.3 }}>Learn · Grow · Share</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const S = {
  page: {
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: '#0e0e14',
    overflow: 'hidden',
  },

  /* ── LEFT PANEL ── */
  leftPanel: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#080810',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 36px 90px 36px', /* extra bottom for stats */
    overflow: 'hidden',
    gap: '24px',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 30% 40%, rgba(108,99,255,0.12) 0%, transparent 65%), radial-gradient(ellipse at 80% 80%, rgba(255,71,87,0.07) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 4,
    marginBottom: '40px',
  },
  logoIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #ff4757 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(108,99,255,0.35)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #fff 30%, rgba(255,255,255,0.55))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.3px',
  },
  headline: {
    position: 'relative',
    zIndex: 4,
  },
  headlineH1: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
    marginBottom: '12px',
  },
  headlineAccent: {
    background: 'linear-gradient(90deg, #6c63ff, #ff4757)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headlineSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  cardsArea: {
    position: 'absolute',
    /* Start cards area below the headline — top 35% of panel reserved for text */
    top: '35%',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  statsRow: {
    position: 'absolute',
    bottom: '28px',
    left: '36px',
    right: '36px',
    display: 'flex',
    gap: '24px',
    zIndex: 4,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  statVal: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  /* Hero image area */
  heroImageWrap: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    minHeight: 0,
  },
  heroImage: {
    width: '100%',
    maxWidth: '480px',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '16px',
    filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.7))',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  heroGlow: {
    position: 'absolute',
    inset: '-20%',
    background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.12) 0%, transparent 65%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroBadge: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '30px',
    padding: '6px 12px 6px 8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
    zIndex: 3,
    whiteSpace: 'nowrap',
  },
  heroBadgeText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.1px',
  },
  heroBadgeLive: {
    fontSize: '8px',
    fontWeight: '700',
    color: '#ff4757',
    background: 'rgba(255,71,87,0.15)',
    borderRadius: '10px',
    padding: '2px 6px',
    letterSpacing: '0.4px',
  },

  /* Cards area (unused but kept for reference) */
  rightPanel: {
    width: '380px',
    minWidth: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12121a',
    borderLeft: '1px solid rgba(255,255,255,0.05)',
    padding: '32px 24px',
    flexShrink: 0,
  },
  formCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  formHeadingSmall: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: '20px',
    letterSpacing: '-0.1px',
  },
  errorBox: {
    backgroundColor: 'rgba(255,71,87,0.12)',
    border: '1px solid rgba(255,71,87,0.28)',
    borderRadius: '8px',
    color: '#ff6b7a',
    padding: '10px 12px',
    fontSize: '12px',
    marginBottom: '14px',
    lineHeight: 1.4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '12px',
  },
  inputWrap: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  input: {
    width: '100%',
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '13px',
    padding: '13px 14px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  loginBtn: {
    width: '100%',
    height: '44px',
    background: 'linear-gradient(135deg, #3a5bd9 0%, #2d4fc4 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 16px rgba(58,91,217,0.3)',
    marginTop: '4px',
    letterSpacing: '0.1px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  forgotLink: {
    textAlign: 'center',
    margin: '12px 0 14px',
    fontSize: '12px',
  },
  linkText: {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s',
    fontSize: '12px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  googleBtn: {
    width: '100%',
    height: '42px',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'border-color 0.2s, color 0.2s',
    marginBottom: '10px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  createAccountBtn: {
    display: 'block',
    width: '100%',
    height: '42px',
    lineHeight: '42px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#6c63ff',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    marginBottom: '20px',
  },
  metaText: {
    textAlign: 'center',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.2px',
  },
};
