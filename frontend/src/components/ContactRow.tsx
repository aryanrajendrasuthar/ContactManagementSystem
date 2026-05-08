import { Star, Pencil, Trash2 } from 'lucide-react';
import type { Contact } from '../types';
import Avatar from './Avatar';

interface Props {
  contact: Contact;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function ContactRow({ contact, onClick, onToggleFavorite, onEdit, onDelete }: Props) {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  return (
    <div className="contact-row" onClick={onClick}>
      <Avatar name={fullName} avatarUrl={contact.avatarUrl} size="sm" />
      <span className="row-name">{fullName}</span>
      <span className="row-email">{contact.email}</span>
      <span className="row-company">{contact.company}</span>
      <span className="row-phone">{contact.phone}</span>
      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className={`btn btn-ghost btn-icon${contact.isFavorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          title="Toggle favorite"
          style={{ color: contact.isFavorite ? '#f59e0b' : undefined }}
        >
          <Star size={14} fill={contact.isFavorite ? '#f59e0b' : 'none'} />
        </button>
        <button className="btn btn-ghost btn-icon" onClick={onEdit} title="Edit">
          <Pencil size={14} />
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onDelete}
          title="Delete"
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
