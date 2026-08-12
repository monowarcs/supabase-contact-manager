import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Key, User, Loader2, AlertTriangle, Info } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Map demo username "abc" to a standard internal email format required by Supabase Auth
      // If the user inputs a full email address directly, use it as-is.
      const email = username.trim() === 'abc' 
        ? 'admin@example.com' 
        : username.trim();

      // Perform actual Supabase Authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        throw authError;
      }

      const user = data.user;
      if (!user) throw new Error('Failed to retrieve user session.');

      // Verify if the authenticated user has an entry in the "admin_users" profile table
      const { data: adminProfile, error: dbError } = await supabase
        .from('admin_users')
        .select('username')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) {
        throw new Error('Database error during administrator validation.');
      }

      if (!adminProfile) {
        // Sign out immediately if they are authenticated in Auth but not authorized in database
        await supabase.auth.signOut();
        throw new Error('Unauthorized. Your account is not registered in the admin_users database.');
      }

      // Success: notify App.jsx of the successful login and admin profile
      if (onLoginSuccess) {
        onLoginSuccess(user, adminProfile.username);
        // Redirect to admin dashboard hash route
        window.location.hash = '#/admin/dashboard';
      }

    } catch (err) {
      console.error('Login error details:', err);
      const statusSuffix = err.status ? ` (Status: ${err.status})` : '';
      setErrorMsg(`${err.message || 'An unexpected error occurred during login.'}${statusSuffix}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <h2>
        <Shield size={22} className="text-primary" />
        Admin Portal
      </h2>

      {errorMsg && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate>
        {/* Username Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="admin-username">Username or Email</label>
          <div className="input-container">
            <User size={18} className="input-icon" />
            <input
              id="admin-username"
              type="text"
              className="form-input"
              placeholder="Enter username (e.g. abc)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="admin-password">Password</label>
          <div className="input-container">
            <Key size={18} className="input-icon" />
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <button 
          id="login-btn"
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading}
          style={{ marginTop: '1rem' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner" />
              Authenticating...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Demo Credentials Info Box */}
      <div className="demo-info-box" style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        borderRadius: 'var(--radius-sm)', 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid var(--card-border)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--primary-light)' }}>
          <Info size={16} />
          <span>Demo Credentials</span>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Username: <code style={{ color: 'var(--text-main)' }}>abc</code><br />
          Password: <code style={{ color: 'var(--text-main)' }}>123</code>
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
          Note: Username "abc" maps to email "admin@example.com" on the Supabase Auth server.
        </p>
      </div>
    </div>
  );
}
