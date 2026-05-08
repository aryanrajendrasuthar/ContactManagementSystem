import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Group } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#64748b'];

interface Props {
  group?: Group | null;
  onSubmit: (name: string, color: string) => Promise<void>;
  onClose: () => void;
}

export default function GroupModal({ group, onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) { setName(group.name); setColor(group.color); }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Group name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(name.trim(), color);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{group ? 'Edit Group' : 'New Group'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: 10 }}>{error}</div>}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Group Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Work, Family, VIP" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <div
                    key={c}
                    className={`color-swatch${color === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (group ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
