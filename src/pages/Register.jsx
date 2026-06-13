import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { register, clearError } from '../redux/authSlice';

const benefits = [
  { icon: '🎓', text: 'Short-form lessons from real instructors' },
  { icon: '🌍', text: 'Explore topics across 10+ languages & domains' },
  { icon: '🔔', text: 'Follow creators & get notified on new drops' },
  { icon: '📌', text: 'Bookmark and revisit lessons anytime' },
];

export default function Register() {
  const [name, setName] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    dispatch(register({ name, email, password }));
  };

  const isValid = name.trim() && email.includes('@') && password.length >= 6;

  return (
    <div style={S.page}>
      {/* ── LEFT: Brand Panel ── */}
      <div style={S.leftPanel}>
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
            Your learning journey{' '}
            <span style={S.headlineAccent}>starts here.</span>
          </h1>
          <p style={S.headlineSub}>
            Join thousands of learners already growing on Skillbase.
          </p>
        </motion.div>

        {/* Benefits list */}
        <div style={S.benefitsList}>
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.45 }}
              style={S.benefitItem}
            >
              <span style={S.benefitIcon}>{b.icon}</span>
              <span style={S.benefitText}>{b.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom gradient bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.5, transformOrigin: 'left' }}
          style={S.gradientBar}
        />
      </div>

      {/* ── RIGHT: Register Form Panel ── */}
      <div style={S.rightPanel}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={S.formCard}
        >
          <p style={S.formHeading}>Create new account</p>
          <p style={S.formSub}>It's quick and easy.</p>

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
            {/* Name */}
            <div style={{
              ...S.inputWrap,
              borderColor: focusedField === 'name' ? '#6c63ff' : 'rgba(255,255,255,0.12)',
              boxShadow: focusedField === 'name' ? '0 0 0 1px #6c63ff' : 'none',
            }}>
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                disabled={loading}
                style={S.input}
              />
            </div>

            {/* Email */}
            <div style={{
              ...S.inputWrap,
              borderColor: focusedField === 'email' ? '#6c63ff' : 'rgba(255,255,255,0.12)',
              boxShadow: focusedField === 'email' ? '0 0 0 1px #6c63ff' : 'none',
            }}>
              <input
                type="email"
                placeholder="Email address"
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
              borderColor: focusedField === 'password' ? '#6c63ff' : 'rgba(255,255,255,0.12)',
              boxShadow: focusedField === 'password' ? '0 0 0 1px #6c63ff' : 'none',
            }}>
              <input
                type="password"
                placeholder="Password (6+ characters)"
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
              disabled={loading || !isValid}
              style={{
                ...S.signupBtn,
                opacity: loading || !isValid ? 0.5 : 1,
                cursor: loading || !isValid ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <Loader size={15} className="animate-spin" /> : 'Sign up'}
            </button>
          </form>

          {/* Divider */}
          <div style={S.divider}>
            <div style={S.dividerLine} />
            <span style={S.dividerText}>Already have an account?</span>
            <div style={S.dividerLine} />
          </div>

          {/* Log in link */}
          <Link to="/login" style={S.loginBtn}>
            Log in
          </Link>

          <p style={S.metaText}>
            By signing up you agree to our{' '}
            <span style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>Terms</span>
            {' & '}
            <span style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>Privacy Policy</span>
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

  /* LEFT */
  leftPanel: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#080810',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 36px',
    overflow: 'hidden',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.14) 0%, transparent 60%), radial-gradient(ellipse at 85% 20%, rgba(255,71,87,0.08) 0%, transparent 55%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 2,
    marginBottom: '44px',
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
    zIndex: 2,
    marginBottom: '40px',
  },
  headlineH1: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
    marginBottom: '10px',
  },
  headlineAccent: {
    background: 'linear-gradient(90deg, #6c63ff, #ff4757)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headlineSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    position: 'relative',
    zIndex: 2,
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  benefitIcon: {
    fontSize: '20px',
    lineHeight: 1,
    flexShrink: 0,
  },
  benefitText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    lineHeight: 1.4,
  },
  gradientBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #6c63ff, #ff4757, #6c63ff)',
    backgroundSize: '200% 100%',
    zIndex: 2,
  },

  /* RIGHT */
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
  },
  formHeading: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  formSub: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '22px',
    fontWeight: '500',
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
    marginBottom: '16px',
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
  signupBtn: {
    width: '100%',
    height: '44px',
    background: 'linear-gradient(135deg, #6c63ff 0%, #5850e6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
    marginTop: '4px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  loginBtn: {
    display: 'block',
    width: '100%',
    height: '42px',
    lineHeight: '42px',
    textAlign: 'center',
    border: '1px solid rgba(108,99,255,0.4)',
    borderRadius: '10px',
    color: '#a89dff',
    fontSize: '13px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'border-color 0.2s, color 0.2s',
    marginBottom: '20px',
  },
  metaText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.2)',
    lineHeight: 1.5,
    textAlign: 'center',
  },
};
