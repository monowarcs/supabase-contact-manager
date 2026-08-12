import React, { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import { supabase } from './lib/supabase';
import { Database, AlertCircle, X, Trash2, HelpCircle } from 'lucide-react';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deleteError, setDeleteError] = useState('');
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch contacts from Supabase
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
      setDeleteError('Failed to fetch contacts from Supabase. Make sure the table exists and RLS policies are set.');
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle click on delete button (opens custom confirmation modal)
  const handleDeleteClick = (contact) => {
    setDeleteError('');
    setContactToDelete(contact);
  };

  // Perform delete action after confirmation
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

      // Reset modal and refresh contacts list
      setContactToDelete(null);
      await fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setDeleteError(`Failed to delete contact: ${err.message || 'Unknown error'}`);
      setContactToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <Database size={36} className="text-primary" style={{ strokeWidth: 2.5 }} />
          Contact Space
        </h1>
        <p className="app-subtitle">
          Secure contact manager integration powered by Vite, React & Supabase
        </p>
      </header>

      {/* Delete/Fetch General Error Alert */}
      {deleteError && (
        <div className="alert alert-error" style={{ maxWidth: '100%', margin: '0 auto 2rem auto' }}>
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

      {/* Grid Layout */}
      <main className="grid-layout">
        {/* Contact Form Card */}
        <section aria-label="Add Contact Form">
          <ContactForm onContactAdded={fetchContacts} />
        </section>

        {/* Contact List Card */}
        <section aria-label="Contact Database List">
          <ContactList 
            contacts={contacts} 
            isLoading={isFetching} 
            onDeleteContact={handleDeleteClick} 
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Contact Space. Designed with vanilla CSS and custom glassmorphism.
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          Connected to: <code>https://efwfvcrucoictzehedfa.supabase.co</code>
        </p>
      </footer>

      {/* Custom Confirmation Modal */}
      {contactToDelete && (
        <div className="modal-overlay" onClick={() => setContactToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              <HelpCircle size={20} className="text-primary" />
              Confirm Deletion
            </h3>
            <div className="modal-body">
              Are you sure you want to delete the contact message from <strong>{contactToDelete.name}</strong> ({contactToDelete.email})? This action cannot be undone.
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
