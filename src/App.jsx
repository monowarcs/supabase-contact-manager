import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { Database, AlertCircle, X, Trash2, HelpCircle } from 'lucide-react';

export default function App() {
  // Routing State ('home' | 'admin-login' | 'admin-dashboard')
  const [currentView, setCurrentView] = useState('home');

  // Authentication State
  const [user, setUser] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Contacts Database State
  const [contacts, setContacts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Hash-based Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentView('admin-login');
      } else if (hash === '#/admin/dashboard') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('home');
      }
    };

    handleHashChange(); // Run on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper: Verify if user has an entry in admin_users table
  const checkAdminProfile = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setAdminUsername('');
      return null;
    }

    try {
      const { data: profile, error } = await supabase
        .from('admin_users')
        .select('username')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setUser(sessionUser);
        setAdminUsername(profile.username);
        return profile.username;
      } else {
        // Authenticated in Supabase Auth but not registered in admin_users table
        await supabase.auth.signOut();
        setUser(null);
        setAdminUsername('');
        return null;
      }
    } catch (err) {
      console.error('Error verifying administrator status:', err);
      setUser(null);
      setAdminUsername('');
      return null;
    }
  };

  // 2. Supabase Session Restoration and Auth Listeners
  useEffect(() => {
    let authListener = null;

    const restoreSession = async () => {
      setIsCheckingAuth(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await checkAdminProfile(session.user);
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setIsCheckingAuth(false);
      }

      // Live subscription to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsCheckingAuth(true);
          await checkAdminProfile(session.user);
          setIsCheckingAuth(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAdminUsername('');
          setContacts([]);
          window.location.hash = '#/admin';
        }
      });
      authListener = subscription;
    };

    restoreSession();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // 3. Fetch Contacts (restricted only when authenticated & registered as admin)
  const fetchContacts = async () => {
    setIsFetching(true);
    setDeleteError('');
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setDeleteError('Failed to fetch contact records. Database permissions denied.');
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch database entries only when admin details are present
  useEffect(() => {
    if (user && adminUsername) {
      fetchContacts();
    } else {
      setContacts([]);
    }
  }, [user, adminUsername]);

  // 4. Admin Logout Trigger
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAdminUsername('');
      setContacts([]);
      window.location.hash = '#/admin';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 5. Delete Contact Handlers
  const handleDeleteClick = (contact) => {
    setDeleteError('');
    setContactToDelete(contact);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactToDelete.id);

      if (error) throw error;

      setContactToDelete(null);
      await fetchContacts(); // Refresh list
    } catch (err) {
      console.error('Error deleting contact:', err);
      setDeleteError(`Failed to delete record: ${err.message || 'Permissions denied'}`);
      setContactToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation 
        currentView={currentView} 
        user={user} 
        adminUsername={adminUsername} 
        onLogout={handleLogout} 
      />

      <main className="app-container" style={{ flexGrow: 1 }}>
        {/* Delete / Permissions error toast */}
        {deleteError && (
          <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            <AlertCircle size={18} />
            <span>{deleteError}</span>
            <button 
              onClick={() => setDeleteError('')} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'inherit', 
                marginLeft: 'auto', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Home / Public Screen */}
        {currentView === 'home' && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <header className="app-header">
              <h1 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <Database size={36} className="text-primary" style={{ strokeWidth: 2.5 }} />
                Contact Space
              </h1>
              <p className="app-subtitle">
                Submit your query below. Our administrators will review your inquiry shortly.
              </p>
            </header>
            <ContactForm onContactAdded={null} />
          </div>
        )}

        {/* Admin Login Screen */}
        {currentView === 'admin-login' && (
          <AdminLogin 
            onLoginSuccess={(sessionUser, username) => {
              setUser(sessionUser);
              setAdminUsername(username);
            }} 
          />
        )}

        {/* Guarded Admin Dashboard Screen */}
        {currentView === 'admin-dashboard' && (
          <ProtectedRoute 
            user={user} 
            adminUsername={adminUsername} 
            isChecking={isCheckingAuth}
            onUnauthorized={handleLogout}
          >
            <AdminDashboard 
              contacts={contacts}
              isFetching={isFetching}
              onContactAdded={fetchContacts}
              onDeleteContact={handleDeleteClick}
              adminUsername={adminUsername}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        )}
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Contact Space. Crafted with vanilla CSS variables and custom glassmorphism.
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          Database Node: <code>https://efwfvcrucoictzehedfa.supabase.co</code>
        </p>
      </footer>

      {/* Delete Confirmation Modal Overlay */}
      {contactToDelete && (
        <div className="modal-overlay" onClick={() => setContactToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              <HelpCircle size={20} className="text-primary" />
              Confirm Record Deletion
            </h3>
            <div className="modal-body">
              Are you sure you want to delete the message from <strong>{contactToDelete.name}</strong> ({contactToDelete.email})? This action is permanent.
            </div>
            <div className="modal-actions">
              <button 
                id="cancel-delete-btn"
                className="btn btn-outline" 
                onClick={() => setContactToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                id="confirm-delete-btn"
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isDeleting ? 'Deleting...' : (
                  <>
                    <Trash2 size={14} />
                    Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
