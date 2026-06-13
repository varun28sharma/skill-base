import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Play, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { register, clearError } from '../redux/authSlice';

export default function Register() {
  const [name, setName] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    dispatch(register({ name, email, password }));
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
        <h2 style={styles.heading}>Create account</h2>
        <p style={styles.subtitle}>Sign up to start sharing and learning</p>

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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="input-group">
            <span className="input-icon-prefix">
              <User size={16} />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
              required
              className="input-field"
              disabled={loading}
            />
          </div>

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
            {loading ? <Loader size={16} className="animate-spin" /> : 'Sign up'}
          </button>
        </form>

        {/* Toggle Auth Route */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <Link to="/login" style={styles.link}>
            Sign in
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
