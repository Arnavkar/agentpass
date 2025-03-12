import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Key, Plus, Trash2, FolderPlus, Folder, AlertTriangle, Copy, Edit, Check, X, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Credential {
  id: string;
  name: string;
  value: string;
  type: string;
  created_at: string;
  modified_at: string;
  group_id: string | null;
}

interface CredentialGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface DeleteModalProps {
  group: CredentialGroup;
  onConfirm: () => void;
  onCancel: () => void;
}

interface EditCredentialModalProps {
  credential: Credential;
  onSave: (id: string, newValue: string) => void;
  onCancel: () => void;
}

function DeleteModal({ group, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-md w-full">
        <div className="flex items-center mb-4 text-yellow-500">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
        </div>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete the group "{group.name}"? This will permanently delete all credentials in this group.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCredentialModal({ credential, onSave, onCancel }: EditCredentialModalProps) {
  const [newValue, setNewValue] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-white">Edit {credential.name}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Value
          </label>
          <input
            type="password"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="input-field"
            placeholder="Enter new value"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(credential.id, newValue)}
            className="btn-primary"
            disabled={!newValue}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function CredentialItem({ credential, onDelete, onEdit }: { 
  credential: Credential; 
  onDelete: (id: string) => void;
  onEdit: (credential: Credential) => void;
}) {
  const [showValue, setShowValue] = useState(credential.type === 'userId' || credential.type === 'clientId');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(credential.value);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="credential-item">
      <div className="flex items-center">
        {credential.type === 'userId' || credential.type === 'clientId' ? (
          <User className="text-indigo-400 mr-3" size={20} />
        ) : (
          <Key className="text-indigo-400 mr-3" size={20} />
        )}
        <div>
          <h3 className="font-medium text-white">{credential.name}</h3>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-400">{credential.type}</p>
            {(credential.type === 'userId' || credential.type === 'clientId') && (
              <p className="text-sm text-gray-300 font-mono">{credential.value}</p>
            )}
            <div className="flex items-center text-gray-500 text-sm" title="Last modified">
              <Clock size={12} className="mr-1" />
              {formatDate(credential.modified_at)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-full transition-colors"
          title="Copy value"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={() => onEdit(credential)}
          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-full transition-colors"
          title="Edit credential"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(credential.id)}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-full transition-colors"
          title="Delete credential"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export function CredentialManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [groups, setGroups] = useState<CredentialGroup[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('password');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [groupToDelete, setGroupToDelete] = useState<CredentialGroup | null>(null);
  const [credentialToEdit, setCredentialToEdit] = useState<Credential | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchCredentials();
  }, []);

  async function fetchGroups() {
    try {
      const { data, error } = await supabase
        .from('credential_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      toast.error('Error fetching groups');
    }
  }

  async function fetchCredentials() {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      toast.error('Error fetching credentials');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('credentials')
        .insert([{ 
          name,
          value,
          type,
          group_id: selectedGroup,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Credential added successfully!');
      setName('');
      setValue('');
      fetchCredentials();
    } catch (error) {
      toast.error('Error adding credential');
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('credential_groups')
        .insert([{
          ...newGroup,
          user_id: user.id
        }]);

      if (error) throw error;
      
      toast.success('Group created successfully!');
      setNewGroup({ name: '', description: '' });
      setShowGroupForm(false);
      fetchGroups();
    } catch (error) {
      toast.error('Error creating group');
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Credential deleted successfully!');
      fetchCredentials();
    } catch (error) {
      toast.error('Error deleting credential');
    }
  }

  async function handleDeleteGroup(group: CredentialGroup) {
    try {
      // First delete all credentials in the group
      const { error: credentialsError } = await supabase
        .from('credentials')
        .delete()
        .eq('group_id', group.id);

      if (credentialsError) throw credentialsError;

      // Then delete the group
      const { error: groupError } = await supabase
        .from('credential_groups')
        .delete()
        .eq('id', group.id);

      if (groupError) throw groupError;
      
      toast.success('Group and associated credentials deleted successfully');
      setGroupToDelete(null);
      fetchGroups();
      fetchCredentials();
    } catch (error) {
      toast.error('Error deleting group');
    }
  }

  async function handleUpdateCredential(id: string, newValue: string) {
    try {
      const { error } = await supabase
        .from('credentials')
        .update({ value: newValue })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Credential updated successfully');
      setCredentialToEdit(null);
      fetchCredentials();
    } catch (error) {
      toast.error('Error updating credential');
    }
  }

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {groupToDelete && (
        <DeleteModal
          group={groupToDelete}
          onConfirm={() => handleDeleteGroup(groupToDelete)}
          onCancel={() => setGroupToDelete(null)}
        />
      )}

      {credentialToEdit && (
        <EditCredentialModal
          credential={credentialToEdit}
          onSave={handleUpdateCredential}
          onCancel={() => setCredentialToEdit(null)}
        />
      )}

      {/* Group Creation Form */}
      <button
        onClick={() => setShowGroupForm(!showGroupForm)}
        className="flex items-center text-indigo-400 hover:text-indigo-300"
      >
        <FolderPlus size={18} className="mr-2" />
        {showGroupForm ? 'Cancel' : 'Create New Group'}
      </button>

      {showGroupForm && (
        <form onSubmit={handleCreateGroup} className="card p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Create New Group</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Group Name</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center"
            >
              <Plus size={18} className="mr-2" />
              Create Group
            </button>
          </div>
        </form>
      )}

      {/* Credential Creation Form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Add New Credential</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
            <input
              type={type === 'userId' || type === 'clientId' ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option value="password">Password</option>
              <option value="api_key">API Key</option>
              <option value="token">Token</option>
              <option value="secret">Secret</option>
              <option value="userId">User ID</option>
              <option value="clientId">Client ID</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Group</label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="input-field"
            >
              <option value="">No Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 btn-primary flex items-center justify-center w-full md:w-auto"
        >
          <Plus size={18} className="mr-2" />
          Add Credential
        </button>
      </form>

      {/* Groups and Credentials Display */}
      <div className="space-y-8">
        {/* Ungrouped Credentials */}
        <div className="credential-group">
          <h2 className="text-xl font-bold mb-4 text-white">Ungrouped Credentials</h2>
          <div className="space-y-4">
            {credentials
              .filter((cred) => !cred.group_id)
              .map((cred) => (
                <CredentialItem
                  key={cred.id}
                  credential={cred}
                  onDelete={handleDelete}
                  onEdit={setCredentialToEdit}
                />
              ))}
          </div>
        </div>

        {/* Grouped Credentials */}
        {groups.map((group) => (
          <div key={group.id} className="credential-group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Folder className="text-indigo-400 mr-3" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white">{group.name}</h2>
                  {group.description && (
                    <p className="text-sm text-gray-400">{group.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setGroupToDelete(group)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {credentials
                .filter((cred) => cred.group_id === group.id)
                .map((cred) => (
                  <CredentialItem
                    key={cred.id}
                    credential={cred}
                    onDelete={handleDelete}
                    onEdit={setCredentialToEdit}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}