import { Users, Star, Plus, Pencil, Trash2, LogOut, BookUser } from 'lucide-react';
import type { Group } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Props {
  groups: Group[];
  totalContacts: number;
  favoriteCount: number;
  activeGroup: string;
  onGroupSelect: (groupId: string) => void;
  onAddGroup: () => void;
  onEditGroup: (g: Group) => void;
  onDeleteGroup: (g: Group) => void;
}

export default function Sidebar({
  groups, totalContacts, favoriteCount, activeGroup,
  onGroupSelect, onAddGroup, onEditGroup, onDeleteGroup
}: Props) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <BookUser size={20} /> Contacts
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Library</div>
        <button
          className={`sidebar-item${activeGroup === 'all' ? ' active' : ''}`}
          onClick={() => onGroupSelect('all')}
        >
          <Users size={15} /> All Contacts
          <span className="count">{totalContacts}</span>
        </button>
        <button
          className={`sidebar-item${activeGroup === 'favorites' ? ' active' : ''}`}
          onClick={() => onGroupSelect('favorites')}
        >
          <Star size={15} /> Favorites
          <span className="count">{favoriteCount}</span>
        </button>
      </div>

      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Groups
          <button className="btn btn-ghost btn-icon" style={{ padding: 2 }} onClick={onAddGroup} title="New group">
            <Plus size={13} />
          </button>
        </div>

        {groups.map(g => (
          <div
            key={g._id}
            className={`sidebar-item${activeGroup === g._id ? ' active' : ''}`}
            onClick={() => onGroupSelect(g._id)}
            style={{ gap: 8 }}
          >
            <span className="group-dot" style={{ background: g.color }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
            <span className="count">{g.contactCount || 0}</span>
            <span
              style={{ display: 'flex', gap: 2, marginLeft: 2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: 2 }}
                onClick={() => onEditGroup(g)}
                title="Edit"
              >
                <Pencil size={11} />
              </button>
              <button
                className="btn btn-ghost btn-icon"
                style={{ padding: 2, color: 'var(--danger)' }}
                onClick={() => onDeleteGroup(g)}
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </span>
          </div>
        ))}

        {groups.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-light)', padding: '4px 10px' }}>
            No groups yet
          </p>
        )}
      </div>

      <div className="user-menu">
        <div className="user-avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
        <span className="user-name">{user?.name}</span>
        <button className="btn btn-ghost btn-icon" onClick={logout} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
