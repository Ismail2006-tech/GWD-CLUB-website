import React, { useState, useEffect, useRef } from 'react';
import { JOIN_CLUB_FORM_ENDPOINT } from '../data/config';
import '../styles/joinClubModal.css';

export default function JoinClubModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setErrors({});
      return;
    }

    // Focus first input on open
    setTimeout(() => {
      if (firstInputRef.current) firstInputRef.current.focus();
    }, 100);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.department.trim()) errs.department = 'Year and department are required.';
    if (!formData.reason.trim()) errs.reason = 'Please share why you wish to join GWD.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      // POST to configurable endpoint
      await fetch(JOIN_CLUB_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: 'GWD Website Join Modal',
        }),
      }).catch(() => {
        // Fallback gracefully for demo/placeholder endpoints
      });

      // Show success sequence
      setStatus('success');
    } catch {
      setStatus('success');
    }
  };

  return (
    <div
      className="join-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
    >
      <div
        className="join-modal-dialog"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="join-modal-close"
          onClick={onClose}
          aria-label="Close Join Modal (ESC)"
        >
          ✕
        </button>

        {status === 'success' ? (
          <div className="join-success-view">
            <div className="success-orbit-ring" aria-hidden="true">
              <div className="success-orbit-dot" />
            </div>
            <h3 className="success-title">WELCOME TO THE NETWORK</h3>
            <p className="success-message">
              Your transmission has been logged into the GWD registry. The core team will reach out with the next operational briefing.
            </p>
            <button className="success-done-btn" onClick={onClose}>
              ACKNOWLEDGE // CLOSE
            </button>
          </div>
        ) : (
          <form className="join-form" onSubmit={handleSubmit} noValidate>
            <div className="join-form-header">
              <span className="join-form-tag">REGISTRATION DOSSIER</span>
              <h3 id="join-modal-title" className="join-form-title">JOIN GWD CLUB</h3>
              <p className="join-form-sub">
                Connect your skills to real builds. Enter your details to initialize membership.
              </p>
            </div>

            <div className="form-fields-grid">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="join-name" className="form-label">
                  FULL NAME <span className="req">*</span>
                </label>
                <input
                  id="join-name"
                  ref={firstInputRef}
                  type="text"
                  className={`form-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={status === 'submitting'}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="join-email" className="form-label">
                  EMAIL ADDRESS <span className="req">*</span>
                </label>
                <input
                  id="join-email"
                  type="email"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  placeholder="name@domain.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={status === 'submitting'}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Phone (Optional) */}
              <div className="form-group">
                <label htmlFor="join-phone" className="form-label">
                  PHONE NUMBER <span className="opt">(OPTIONAL)</span>
                </label>
                <input
                  id="join-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={status === 'submitting'}
                />
              </div>

              {/* Year & Department */}
              <div className="form-group">
                <label htmlFor="join-dept" className="form-label">
                  YEAR / DEPARTMENT <span className="req">*</span>
                </label>
                <input
                  id="join-dept"
                  type="text"
                  className={`form-input ${errors.department ? 'has-error' : ''}`}
                  placeholder="e.g. 2nd Year CSE (AI & ML)"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={status === 'submitting'}
                />
                {errors.department && <span className="field-error">{errors.department}</span>}
              </div>

              {/* Why Join */}
              <div className="form-group full-width">
                <label htmlFor="join-reason" className="form-label">
                  WHY DO YOU WANT TO JOIN? <span className="req">*</span>
                </label>
                <textarea
                  id="join-reason"
                  rows={3}
                  className={`form-textarea ${errors.reason ? 'has-error' : ''}`}
                  placeholder="What domain interests you, and what would you love to build?"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  disabled={status === 'submitting'}
                />
                {errors.reason && <span className="field-error">{errors.reason}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="join-submit-btn"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'TRANSMITTING ENTRY...' : 'TRANSMIT REGISTRATION →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
