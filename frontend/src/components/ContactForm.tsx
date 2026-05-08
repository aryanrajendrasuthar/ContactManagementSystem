import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import type { Contact, Group } from '../types';
import Avatar from './Avatar';

interface Props {
  contact?: Contact | null;
  groups: Group[];
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', company: '',
  street: '', city: '', state: '', country: '', zip: '',
  tags: '', notes: '', groupId: '',
  linkedin: '', twitter: '', github: '', website: '',
};

export default function ContactForm({ contact, groups, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contact) {
      setForm({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        street: contact.address?.street || '',
        city: contact.address?.city || '',
        state: contact.address?.state || '',
        country: contact.address?.country || '',
        zip: contact.address?.zip || '',
        tags: (contact.tags || []).join(', '),
        notes: contact.notes || '',
        groupId: (contact.groupId as Group)?._id || '',
        linkedin: contact.socialLinks?.linkedin || '',
        twitter: contact.socialLinks?.twitter || '',
        github: contact.socialLinks?.github || '',
        website: contact.socialLinks?.website || '',
      });
      if (contact.avatarUrl) setAvatarPreview(contact.avatarUrl.startsWith('/uploads') ? `http://localhost:5000${contact.avatarUrl}` : contact.avatarUrl);
    }
  }, [contact]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) { setError('First name is required'); return; }
    setError('');
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (!['street', 'city', 'state', 'country', 'zip', 'linkedin', 'twitter', 'github', 'website'].includes(k)) {
        fd.append(k, v);
      }
    });

    fd.append('address', JSON.stringify({
      street: form.street, city: form.city,
      state: form.state, country: form.country, zip: form.zip
    }));

    fd.append('socialLinks', JSON.stringify({
      linkedin: form.linkedin, twitter: form.twitter,
      github: form.github, website: form.website
    }));

    if (avatarFile) fd.append('avatar', avatarFile);

    try {
      await onSubmit(fd);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const previewName = `${form.firstName} ${form.lastName}`.trim() || 'Contact';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact ? 'Edit Contact' : 'New Contact'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

            {/* Avatar upload */}
            <div
              className="avatar-upload-area"
              style={{ marginBottom: 18 }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="avatar-preview">
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" />
                  : <Avatar name={previewName} size="md" />
                }
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Upload size={14} /> Upload photo
              </span>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" value={form.firstName} onChange={set('firstName')} placeholder="John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-input" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label className="form-label">Group</label>
                <select className="form-select" value={form.groupId} onChange={set('groupId')}>
                  <option value="">No group</option>
                  {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags} onChange={set('tags')} placeholder="friend, work, vip" />
              </div>

              <div className="form-group full" style={{ marginTop: 4 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>Address</label>
                <div className="form-grid" style={{ marginTop: 0 }}>
                  <div className="form-group full">
                    <input className="form-input" value={form.street} onChange={set('street')} placeholder="Street" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.city} onChange={set('city')} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.state} onChange={set('state')} placeholder="State" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.country} onChange={set('country')} placeholder="Country" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.zip} onChange={set('zip')} placeholder="ZIP" />
                  </div>
                </div>
              </div>

              <div className="form-group full" style={{ marginTop: 4 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>Social Links</label>
                <div className="form-grid" style={{ marginTop: 0 }}>
                  <div className="form-group">
                    <input className="form-input" value={form.linkedin} onChange={set('linkedin')} placeholder="LinkedIn URL" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.twitter} onChange={set('twitter')} placeholder="Twitter URL" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.github} onChange={set('github')} placeholder="GitHub URL" />
                  </div>
                  <div className="form-group">
                    <input className="form-input" value={form.website} onChange={set('website')} placeholder="Website URL" />
                  </div>
                </div>
              </div>

              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={set('notes')} placeholder="Additional notes..." />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (contact ? 'Save Changes' : 'Add Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
