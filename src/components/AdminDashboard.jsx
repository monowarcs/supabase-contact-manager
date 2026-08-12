import React from 'react';
import ContactForm from './ContactForm';
import ContactList from './ContactList';
import { User, LogOut, Shield, BarChart3 } from 'lucide-react';

export default function AdminDashboard({ 
  contacts, 
  isFetching, 
  onDeleteContact, 
  onContactAdded, 
  adminUsername, 
  onLogout 
}) {
  return (
    <div className="admin-dashboard-container">
      {/* Admin Dashboard Subheader */}
      <div className="admin-header-bar card" style={{ marginBottom: '2rem', padding: '1.25rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield className="text-primary" size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#fff' }}>Admin Workstation</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Logged in as: <strong style={{ color: 'var(--primary-light)' }}>{adminUsername}</strong>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Total Contacts Counter */}
            {!isFetching && (
              <div className="admin-stat-pill" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'var(--primary-glow)', 
                color: 'var(--primary-light)', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <BarChart3 size={16} />
                <span>Total Contacts: {contacts.length}</span>
              </div>
            )}
            
            <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid-layout">
        {/* Left Column: Manual Form Submission */}
        <section aria-label="Manual Contact Entry Form">
          <ContactForm onContactAdded={onContactAdded} />
        </section>
        
        {/* Right Column: Database Records list */}
        <section aria-label="Database Contacts List">
          <ContactList 
            contacts={contacts} 
            isLoading={isFetching} 
            onDeleteContact={onDeleteContact} 
          />
        </section>
      </div>
    </div>
  );
}
