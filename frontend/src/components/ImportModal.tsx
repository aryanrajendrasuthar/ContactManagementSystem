import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { contactsAPI } from '../services/api';

interface Props {
  onClose: () => void;
  onImported: (count: number) => void;
}

interface PreviewRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

function parsePreview(text: string): PreviewRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const idx = (candidates: string[]) =>
    candidates.reduce<number>((found, c) => found !== -1 ? found : headers.findIndex(h => h.toLowerCase() === c.toLowerCase()), -1);

  const firstNameIdx = idx(['firstName', 'first_name', 'First Name', 'firstname']);
  const lastNameIdx = idx(['lastName', 'last_name', 'Last Name', 'lastname']);
  const emailIdx = idx(['email', 'Email']);
  const phoneIdx = idx(['phone', 'Phone']);
  const companyIdx = idx(['company', 'Company']);

  return lines.slice(1, 6).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    return {
      firstName: firstNameIdx !== -1 ? cols[firstNameIdx] : '',
      lastName: lastNameIdx !== -1 ? cols[lastNameIdx] : '',
      email: emailIdx !== -1 ? cols[emailIdx] : '',
      phone: phoneIdx !== -1 ? cols[phoneIdx] : '',
      company: companyIdx !== -1 ? cols[companyIdx] : '',
    };
  }).filter(r => r.firstName);
}

export default function ImportModal({ onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    if (!f.name.endsWith('.csv')) { setError('Please select a .csv file'); return; }
    setFile(f);
    setError('');
    setSuccess('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(parsePreview(text));
    };
    reader.readAsText(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('csv', file);
      const res = await contactsAPI.import(fd);
      setSuccess(res.data.message);
      onImported(res.data.imported);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Contacts</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--success-bg, #f0fdf4)', color: 'var(--success, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
              <CheckCircle2 size={14} /> {success}
            </div>
          )}

          {!success && (
            <>
              <div
                className={`csv-dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileInput} />
                {file ? (
                  <>
                    <FileText size={28} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, marginTop: 6 }}>{file.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB — click to change</span>
                  </>
                ) : (
                  <>
                    <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 600, marginTop: 6 }}>Drop your CSV here</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or click to browse</span>
                  </>
                )}
              </div>

              {preview.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Preview (first {preview.length} rows)
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                          {['First Name', 'Last Name', 'Email', 'Phone', 'Company'].map(h => (
                            <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} style={{ borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td style={{ padding: '7px 12px' }}>{row.firstName}</td>
                            <td style={{ padding: '7px 12px' }}>{row.lastName}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--text-muted)' }}>{row.email}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--text-muted)' }}>{row.phone}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--text-muted)' }}>{row.company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Supported columns: firstName, lastName, email, phone, company, tags, notes, street, city, state, country, zip, linkedin, twitter, github, website
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && (
            <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
              {loading ? <span className="spinner" /> : `Import${preview.length ? ` (${preview.length}+ contacts)` : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
