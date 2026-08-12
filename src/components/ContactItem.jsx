import React from 'react';
import { Mail, Calendar, Trash2 } from 'lucide-react';

export default function ContactItem({ contact, onDelete }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="contact-item" data-id={contact.id}>
      <div className="contact-info">
        <div className="contact-header">
          <span className="contact-name">{contact.name}</span>
          <a href={`mailto:${contact.email}`} className="contact-email">
            <Mail size={12} />
            {contact.email}
          </a>
        </div>
        
        <div className="contact-message">
          {contact.message}
        </div>
        
        <div className="contact-date">
          <Calendar size={12} />
          <span>{formatDate(contact.created_at)}</span>
        </div>
      </div>
      
      <button 
        className="btn btn-danger" 
        onClick={() => onDelete(contact)}
        title="Delete Contact"
        aria-label="Delete Contact"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
