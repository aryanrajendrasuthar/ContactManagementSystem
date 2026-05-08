import { Star } from 'lucide-react';
import type { Contact } from '../types';
import Avatar from './Avatar';

interface Props {
  contact: Contact;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export default function ContactCard({ contact, onClick, onToggleFavorite }: Props) {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();

  return (
    <div className="contact-card" onClick={onClick}>
      <button
        className={`card-fav-btn${contact.isFavorite ? ' active' : ''}`}
        onClick={onToggleFavorite}
        title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={14} fill={contact.isFavorite ? '#f59e0b' : 'none'} />
      </button>

      <Avatar name={fullName} avatarUrl={contact.avatarUrl} size="md" />
      <div className="card-name">{fullName}</div>
      {contact.company && <div className="card-company">{contact.company}</div>}
      {contact.email && <div className="card-email">{contact.email}</div>}

      {contact.groupId && (
        <div
          className="card-group-badge"
          style={{ background: `${contact.groupId.color}20`, color: contact.groupId.color }}
        >
          <span
            className="group-dot"
            style={{ background: contact.groupId.color, width: 6, height: 6 }}
          />
          {contact.groupId.name}
        </div>
      )}
    </div>
  );
}
