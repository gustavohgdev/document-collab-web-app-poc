import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Document } from '../../types/document';
import { documentApi } from '../../api/documents';
import { useAutoDismissError } from '../../hooks/useAutoDissmissError';

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useAutoDismissError();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await documentApi.getDocuments();
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await documentApi.createDocument(newTitle);
      setNewTitle('');
      loadDocuments();
    } catch (err) {
      setError('Failed to create document');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <form onSubmit={handleCreateDocument}>
          <div className="flex gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter document title"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Document
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md animate-fade-in">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {documents.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No documents yet. Create your first document above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  to={`/documents/${doc.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {doc.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Owner: {doc.owner.username}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
