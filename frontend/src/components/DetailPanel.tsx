import { X, Mail, Phone, MapPin, Tag, StickyNote, Star, Pencil, Trash2, Link } from 'lucide-react';
import type { Contact } from '../types';
import Avatar from './Avatar';

interface Props {
  contact: Contact;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function DetailPanel({ contact, onClose, onEdit, onDelete, onToggleFavorite }: Props) {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  const addressParts = [
    contact.address?.street,
    contact.address?.city,
    contact.address?.state,
    contact.address?.country
  ].filter(Boolean);

  const socialEntries = Object.entries(contact.socialLinks || {}).filter(([, v]) => v);

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h3>Contact Details</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="detail-body">
          <Avatar name={fullName} avatarUrl={contact.avatarUrl} size="lg" />

          <div className="detail-name">{fullName}</div>
          {contact.company && <div className="detail-company">{contact.company}</div>}

          {contact.groupId && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <span
                className="card-group-badge"
                style={{ background: `${contact.groupId.color}20`, color: contact.groupId.color }}
              >
                <span className="group-dot" style={{ background: contact.groupId.color, width: 6, height: 6 }} />
                {contact.groupId.name}
              </span>
            </div>
          )}

          {(contact.email || contact.phone) && (
            <div className="detail-section">
              <div className="detail-section-title">Contact Info</div>
              {contact.email && (
                <div className="detail-field">
                  <Mail size={15} className="detail-field-icon" />
                  <div>
                    <div className="detail-field-label">Email</div>
                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary)' }}>{contact.email}</a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="detail-field">
                  <Phone size={15} className="detail-field-icon" />
                  <div>
                    <div className="detail-field-label">Phone</div>
                    <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {addressParts.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Address</div>
              <div className="detail-field">
                <MapPin size={15} className="detail-field-icon" />
                <span>{addressParts.join(', ')}</span>
              </div>
            </div>
          )}

          {contact.tags?.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Tags</div>
              <div className="detail-field">
                <Tag size={15} className="detail-field-icon" />
                <div className="detail-tags">
                  {contact.tags.map(tag => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {socialEntries.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Social Links</div>
              {socialEntries.map(([key, val]) => (
                <div key={key} className="detail-field">
                  <Link size={15} className="detail-field-icon" />
                  <div>
                    <div className="detail-field-label" style={{ textTransform: 'capitalize' }}>{key}</div>
                    <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 13 }}>
                      {val}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {contact.notes && (
            <div className="detail-section">
              <div className="detail-section-title">Notes</div>
              <div className="detail-field">
                <StickyNote size={15} className="detail-field-icon" />
                <span style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>{contact.notes}</span>
              </div>
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button
            className={`btn btn-secondary btn-icon`}
            onClick={onToggleFavorite}
            title="Toggle favorite"
            style={{ color: contact.isFavorite ? '#f59e0b' : undefined }}
          >
            <Star size={16} fill={contact.isFavorite ? '#f59e0b' : 'none'} />
          </button>
          <button className="btn btn-secondary" onClick={onEdit} style={{ flex: 1 }}>
            <Pencil size={15} /> Edit
          </button>
          <button className="btn btn-danger" onClick={onDelete} style={{ flex: 1 }}>
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
