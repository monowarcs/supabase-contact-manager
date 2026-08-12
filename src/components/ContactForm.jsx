import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, MessageSquare, PlusCircle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ContactForm({ onContactAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // UI & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Field-specific validation errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      tempErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempErrors.email = 'Invalid email address format';
      }
    }
    
    if (!message.trim()) {
      tempErrors.message = 'Message is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          { 
            name: name.trim(), 
            email: email.trim(), 
            message: message.trim() 
          }
        ])
        .select();

      if (error) throw error;

      // Handle successful insertion
      setSuccessMessage('Contact added successfully!');
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
      
      // Notify parent to refresh the contact list
      if (onContactAdded) {
        onContactAdded();
      }

      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
      
    } catch (err) {
      console.error('Error inserting contact:', err);
      setErrorMessage(err.message || 'Failed to submit contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>
        <PlusCircle size={22} className="text-primary" />
        New Contact
      </h2>
      
      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Name Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <div className="input-container">
            <User size={18} className="input-icon" />
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <span className="error-text">
              <AlertTriangle size={12} /> {errors.name}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <div className="input-container">
            <Mail size={18} className="input-icon" />
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <span className="error-text">
              <AlertTriangle size={12} /> {errors.email}
            </span>
          )}
        </div>

        {/* Message Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="message">Message</label>
          <div className="input-container">
            <MessageSquare size={18} className="textarea-icon" />
            <textarea
              id="message"
              className="form-input form-textarea"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
              }}
              disabled={isLoading}
            />
          </div>
          {errors.message && (
            <span className="error-text">
              <AlertTriangle size={12} /> {errors.message}
            </span>
          )}
        </div>

        <button 
          id="add-contact-btn"
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle size={18} />
              Add Contact
            </>
          )}
        </button>
      </form>
    </div>
  );
}
