import React, { useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, user, adminUsername, isChecking, onUnauthorized }) {
  useEffect(() => {
    if (!isChecking && !user) {
      // Redirect to login page if session is not available
      window.location.hash = '#/admin';
    }
  }, [user, isChecking]);

  if (isChecking) {
    return (
      <div className="loading-state" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Loader2 size={32} className="spinner" />
        <p>Restoring administrator session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!adminUsername) {
    return (
      <div className="card text-center" style={{ maxWidth: '500px', margin: '3rem auto', padding: '2.5rem' }}>
        <div style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <ShieldAlert size={48} />
        </div>
        <h2 style={{ border: 'none', padding: '0', margin: '0 0 1rem 0', justifyContent: 'center' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          You are authenticated, but your account is not registered as an administrator.
        </p>
        <button 
          className="btn btn-outline" 
          onClick={onUnauthorized}
          style={{ width: 'auto', margin: '0 auto' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
