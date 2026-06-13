import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Play, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { login, clearError, loginWithGoogle } from '../redux/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on mount
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
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={styles.card}
      >
        {/* App Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Play size={18} color="#ffffff" fill="#ffffff" style={{ marginLeft: '2px' }} />
          </div>
        </div>

        {/* Headings */}
        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to continue your learning journey</p>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.errorAlert}
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="input-group">
            <span className="input-icon-prefix">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <span className="input-icon-prefix">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {loading ? <Loader size={16} className="animate-spin" /> : 'Sign in'}
          </button>
        </form>

        {/* Google Sign-in Option */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-google"
          style={{ marginBottom: '10px' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#ea4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.309 2.69 1.255 6.627l4.01 3.138z"
            />
            <path
              fill="#34a853"
              d="M16.04 15.341c-1.07.727-2.437 1.159-4.04 1.159a7.07 7.07 0 0 1-6.734-4.856L1.256 14.78C3.31 18.718 7.355 21.4 12 21.4c3.09 0 5.864-1.018 7.827-2.773l-3.787-3.286z"
            />
            <path
              fill="#4285f4"
              d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.473a5.533 5.533 0 0 1-2.4 3.627l3.787 3.286c2.213-2.036 3.63-5.036 3.63-8.77l.001-.27z"
            />
            <path
              fill="#fbbc05"
              d="M5.266 14.235A7.02 7.02 0 0 1 4.909 12c0-.791.136-1.555.357-2.264L1.256 6.627A11.917 11.917 0 0 0 0 12c0 1.927.455 3.745 1.255 5.373l4.011-3.138z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Toggle Auth Route */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account? </span>
          <Link to="/register" style={styles.link}>
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: '24px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#6c63ff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '6px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '28px',
    textAlign: 'center',
  },
  errorAlert: {
    width: '100%',
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    border: '1px solid rgba(255, 71, 87, 0.3)',
    borderRadius: '8px',
    color: '#ff4757',
    padding: '10px 14px',
    fontSize: '12px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '48px',
  },
  footer: {
    marginTop: '24px',
    fontSize: '13px',
    textAlign: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  link: {
    color: '#6c63ff',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
};
