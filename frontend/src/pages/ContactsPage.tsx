import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { LayoutGrid, List, Plus, Download, Search, Upload } from 'lucide-react';
import type { Contact, Group, ViewMode } from '../types';
import { contactsAPI, groupsAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import ContactCard from '../components/ContactCard';
import ContactRow from '../components/ContactRow';
import ContactForm from '../components/ContactForm';
import DetailPanel from '../components/DetailPanel';
import GroupModal from '../components/GroupModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ImportModal from '../components/ImportModal';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeGroup, setActiveGroup] = useState('all');
  const [view, setView] = useState<ViewMode>('grid');

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null | undefined>(undefined);
  const [showContactForm, setShowContactForm] = useState(false);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'contact' | 'group'; item: Contact | Group } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeGroup === 'favorites') params.favorite = 'true';
      else if (activeGroup !== 'all') params.group = activeGroup;

      const res = await contactsAPI.getAll(params);
      setContacts(res.data.contacts);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeGroup]);

  const fetchTotalCount = useCallback(async () => {
    try {
      const res = await contactsAPI.getAll({ limit: '1' });
      setTotalContacts(res.data.total);
    } catch {
      // silent
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await groupsAPI.getAll();
      setGroups(res.data.groups);
    } catch {
      // silent
    }
  }, []);

  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await contactsAPI.getAll({ favorite: 'true', limit: '100' });
      setFavoriteCount(res.data.total);
      setFavoriteContacts(res.data.contacts);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchGroups();
    fetchFavoriteCount();
    fetchTotalCount();
  }, [fetchGroups, fetchFavoriteCount, fetchTotalCount]);

  const handleCreateContact = async (data: FormData) => {
    await contactsAPI.create(data);
    toast.success('Contact added');
    setShowContactForm(false);
    setEditingContact(undefined);
    fetchContacts();
    fetchFavoriteCount();
    fetchTotalCount();
  };

  const handleUpdateContact = async (data: FormData) => {
    if (!editingContact) return;
    await contactsAPI.update(editingContact._id, data);
    toast.success('Contact updated');
    setShowContactForm(false);
    setEditingContact(undefined);
    if (selectedContact?._id === editingContact._id) setSelectedContact(null);
    fetchContacts();
    fetchFavoriteCount();
  };

  const handleDeleteContact = async () => {
    if (!confirmDelete || confirmDelete.type !== 'contact') return;
    setDeleteLoading(true);
    try {
      await contactsAPI.delete((confirmDelete.item as Contact)._id);
      toast.success('Contact deleted');
      if (selectedContact?._id === (confirmDelete.item as Contact)._id) setSelectedContact(null);
      fetchContacts();
      fetchFavoriteCount();
      fetchTotalCount();
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleToggleFavorite = async (contact: Contact) => {
    try {
      const res = await contactsAPI.toggleFavorite(contact._id);
      const updated = res.data.contact;
      setContacts(prev => prev.map(c => c._id === updated._id ? updated : c));
      if (selectedContact?._id === updated._id) setSelectedContact(updated);
      fetchFavoriteCount();
      if (activeGroup === 'favorites') fetchContacts();
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleExport = async () => {
    try {
      const res = await contactsAPI.export();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Contacts exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleAddGroup = () => {
    setEditingGroup(null);
    setShowGroupModal(true);
  };

  const handleEditGroup = (g: Group) => {
    setEditingGroup(g);
    setShowGroupModal(true);
  };

  const handleGroupSubmit = async (name: string, color: string) => {
    if (editingGroup) {
      await groupsAPI.update(editingGroup._id, { name, color });
      toast.success('Group updated');
    } else {
      await groupsAPI.create({ name, color });
      toast.success('Group created');
    }
    setShowGroupModal(false);
    setEditingGroup(null);
    fetchGroups();
    fetchContacts();
  };

  const handleDeleteGroup = async () => {
    if (!confirmDelete || confirmDelete.type !== 'group') return;
    setDeleteLoading(true);
    try {
      await groupsAPI.delete((confirmDelete.item as Group)._id);
      toast.success('Group deleted');
      if (activeGroup === (confirmDelete.item as Group)._id) setActiveGroup('all');
      fetchGroups();
      fetchContacts();
    } catch {
      toast.error('Failed to delete group');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleImported = (count: number) => {
    toast.success(`Imported ${count} contact${count !== 1 ? 's' : ''}`);
    setShowImport(false);
    fetchContacts();
    fetchFavoriteCount();
    fetchGroups();
    fetchTotalCount();
  };

  const openEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
    setSelectedContact(null);
  };

  const openNewContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const currentGroupName = activeGroup === 'all'
    ? 'All Contacts'
    : activeGroup === 'favorites'
    ? 'Favorites'
    : groups.find(g => g._id === activeGroup)?.name || 'Contacts';

  return (
    <div className="app-layout">
      <Sidebar
        groups={groups}
        totalContacts={totalContacts}
        favoriteCount={favoriteCount}
        activeGroup={activeGroup}
        onGroupSelect={(id) => { setActiveGroup(id); setSelectedContact(null); }}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={(g) => setConfirmDelete({ type: 'group', item: g })}
      />

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{currentGroupName}</h1>
            {!loading && <span className="topbar-count">{contacts.length} contacts</span>}
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search contacts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button
                className={`btn btn-ghost btn-icon${view === 'grid' ? ' active' : ''}`}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`btn btn-ghost btn-icon${view === 'list' ? ' active' : ''}`}
                onClick={() => setView('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowImport(true)} title="Import CSV">
              <Download size={15} /> Import
            </button>
            <button className="btn btn-secondary" onClick={handleExport} title="Export CSV">
              <Upload size={15} /> Export
            </button>
            <button className="btn btn-primary" onClick={openNewContact}>
              <Plus size={15} /> New Contact
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeGroup === 'all' && !debouncedSearch && favoriteContacts.length > 0 && (
            <div className="favorites-section">
              <div className="section-label">Pinned Favorites</div>
              <div className="favorites-row">
                {favoriteContacts.slice(0, 8).map(c => (
                  <button
                    key={c._id}
                    className="favorite-chip"
                    onClick={() => setSelectedContact(c)}
                    title={`${c.firstName} ${c.lastName}`.trim()}
                  >
                    <Avatar name={`${c.firstName} ${c.lastName}`.trim()} avatarUrl={c.avatarUrl} size="sm" />
                    <span>{c.firstName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <span className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <Avatar name="?" size="lg" />
              <p style={{ marginTop: 16, fontWeight: 600, fontSize: 16 }}>No contacts found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                {search ? 'Try a different search term' : 'Add your first contact to get started'}
              </p>
              {!search && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNewContact}>
                  <Plus size={15} /> Add Contact
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="contact-grid">
              {contacts.map(c => (
                <ContactCard
                  key={c._id}
                  contact={c}
                  onClick={() => setSelectedContact(c)}
                  onToggleFavorite={() => handleToggleFavorite(c)}
                />
              ))}
            </div>
          ) : (
            <div className="contact-list">
              {contacts.map(c => (
                <ContactRow
                  key={c._id}
                  contact={c}
                  onClick={() => setSelectedContact(c)}
                  onEdit={() => openEditContact(c)}
                  onDelete={() => setConfirmDelete({ type: 'contact', item: c })}
                  onToggleFavorite={() => handleToggleFavorite(c)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedContact && (
        <DetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={() => openEditContact(selectedContact)}
          onDelete={() => setConfirmDelete({ type: 'contact', item: selectedContact })}
          onToggleFavorite={() => handleToggleFavorite(selectedContact)}
        />
      )}

      {showContactForm && (
        <ContactForm
          contact={editingContact}
          groups={groups}
          onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
          onClose={() => { setShowContactForm(false); setEditingContact(undefined); }}
        />
      )}

      {showGroupModal && (
        <GroupModal
          group={editingGroup}
          onSubmit={handleGroupSubmit}
          onClose={() => { setShowGroupModal(false); setEditingGroup(null); }}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === 'contact' ? 'Delete Contact' : 'Delete Group'}
          message={
            confirmDelete.type === 'contact'
              ? `Are you sure you want to delete "${(confirmDelete.item as Contact).firstName} ${(confirmDelete.item as Contact).lastName}"? This cannot be undone.`
              : `Are you sure you want to delete group "${(confirmDelete.item as Group).name}"? Contacts in this group will be unassigned.`
          }
          onConfirm={confirmDelete.type === 'contact' ? handleDeleteContact : handleDeleteGroup}
          onClose={() => setConfirmDelete(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
