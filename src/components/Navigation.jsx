import React from 'react';
import { Home, ShieldAlert, ShieldCheck, LogOut, Database } from 'lucide-react';

export default function Navigation({ currentView, user, adminUsername, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Database size={22} className="text-primary" />
          <span className="brand-text">Contact Space</span>
        </div>
        <div className="nav-links">
          <a 
            href="#/" 
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          >
            <Home size={16} />
            <span>New Contact</span>
          </a>
          
          {user ? (
            <>
              <a 
                href="#/admin/dashboard" 
                className={`nav-item ${currentView === 'admin-dashboard' ? 'active' : ''}`}
              >
                <ShieldCheck size={16} />
                <span>Dashboard</span>
              </a>
              <button onClick={onLogout} className="nav-btn-logout" aria-label="Log out">
                <LogOut size={16} />
                <span className="logout-text">Logout</span>
              </button>
            </>
          ) : (
            <a 
              href="#/admin" 
              className={`nav-item ${currentView === 'admin-login' ? 'active' : ''}`}
            >
              <ShieldAlert size={16} />
              <span>Admin</span>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
