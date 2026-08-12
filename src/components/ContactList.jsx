import React from 'react';
import ContactItem from './ContactItem';
import { Users, Loader2, Inbox } from 'lucide-react';

export default function ContactList({ contacts, isLoading, onDeleteContact }) {
  if (isLoading) {
    return (
      <div className="card">
        <h2>
          <Users size={22} className="text-primary" />
          Contacts
        </h2>
        <div className="loading-state">
          <Loader2 size={32} className="spinner" />
          <p>Fetching contacts from Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>
        <Users size={22} className="text-primary" />
        Contacts
        {contacts.length > 0 && (
          <span style={{ 
            fontSize: '0.8rem', 
            background: 'var(--primary-glow)', 
            color: 'var(--primary-light)', 
            padding: '0.15rem 0.6rem', 
            borderRadius: '50px', 
            marginLeft: 'auto' 
          }}>
            {contacts.length}
          </span>
        )}
      </h2>

      {contacts.length === 0 ? (
        <div className="empty-state">
          <Inbox size={36} />
          <p>No contacts found</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>
            Submit the form on the left to add a new contact.
          </span>
        </div>
      ) : (
        <div className="contacts-wrapper">
          {contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onDelete={onDeleteContact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
