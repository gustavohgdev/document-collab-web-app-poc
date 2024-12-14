import { useEffect } from 'react';
import { documentApi } from '../../api/documents';
import { Document } from '../../types/document';
import { useState } from 'react';
import { useAutoDismissError } from '../../hooks/useAutoDissmissError';

interface CollaboratorManagementProps {
  documentId: number;
}

export function CollaboratorManagement({ documentId }: CollaboratorManagementProps) {
  const [collaborators, setCollaborators] = useState<Document['collaborators']>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT' | 'ADMIN'>('VIEW');
  const [error, setError] = useAutoDismissError();

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const response = await documentApi.getCollaborators(documentId);
      setCollaborators(response.data);
    } catch {
      setError('Failed to load collaborators');
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.trim()) return;
    try {
      await documentApi.addCollaborator(documentId, newCollaborator, permission);
      setNewCollaborator('');
      setPermission('VIEW');
      loadCollaborators();
    } catch {
      setError(`Failed to add collaborator ${newCollaborator}`);
    }
  };

  const handleRemoveCollaborator = async (username: string) => {
    try {
      await documentApi.removeCollaborator(documentId, username);
      loadCollaborators();
    } catch {
      setError('Failed to remove collaborator');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Collaborators</h2>
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md animate-fade-in">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {collaborators.map((collaborator) => (
          <li key={collaborator.id} className="flex justify-between py-2">
            <span>{`- Username: ${collaborator.user.username} with ${collaborator.permission} permissions`}</span>
            <button
              onClick={() => handleRemoveCollaborator(collaborator.user.username)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Username"
          value={newCollaborator}
          onChange={(e) => setNewCollaborator(e.target.value)}
          className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as 'VIEW' | 'EDIT' | 'ADMIN')}
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="VIEW">View</option>
          <option value="EDIT">Edit</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={handleAddCollaborator}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
