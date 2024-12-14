import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document } from '../../types/document';
import { documentApi } from '../../api/documents';
import { CollaboratorManagement } from '../collaborators/CollaboratorManagement';
import { useAuth } from '../../context/AuthContext';
import { useAutoDismissError } from '../../hooks/useAutoDissmissError';

export function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [transientError, setTransientError] = useAutoDismissError(); // Auto-dismissing errors
  const [connectionError, setConnectionError] = useState(''); // Persistent connection errors
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  const getWebSocketUrl = (documentId: string) => {
    const token = localStorage.getItem("token");
    return `ws://localhost:8000/ws/document/${documentId}/?token=${token}`;
  };

  const initializeWebSocket = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      ws.current = new WebSocket(getWebSocketUrl(id!));

      ws.current.onopen = () => {
        console.log("WebSocket connection established");
        setWsConnected(true);
        setReconnectAttempts(0);
        setConnectionError(''); // Clear connection errors on successful connection
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'change') {
            setContent(data.content.text);
          }
        } catch (err) {
          setTransientError("Error processing document update");
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
        setConnectionError('Connection error occurred. Some changes might not be saved.');
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code);
        setWsConnected(false);
        
        // Only attempt to reconnect if it wasn't a normal closure
        if (event.code !== 1000) {
          if (reconnectAttempts < 5) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            setReconnectAttempts((prev) => prev + 1);
            reconnectTimer.current = window.setTimeout(() => {
              console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
              initializeWebSocket();
            }, timeout);
            setConnectionError('Connection lost. Attempting to reconnect...');
          } else {
            console.error("Max reconnect attempts reached");
            setConnectionError('Connection lost. Please refresh the page to continue editing.');
          }
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setConnectionError('Failed to establish connection. Please try refreshing the page.');
    }
  };

  useEffect(() => {
    let mounted = true;

    if (id) {
      documentApi.getDocument(Number(id))
        .then(response => {
          if (mounted) {
            setDocument(response.data);
            setContent(response.data.content.text || '');
            setLoading(false);
            initializeWebSocket();
          }
        })
        .catch((_err) => {
          if (mounted) {
            setTransientError('Failed to load document. Please try again.');
            setLoading(false);
          }
        });

      return () => {
        mounted = false;
        if (ws.current) {
          ws.current.close(1000, "Component unmounting");
        }
        if (reconnectTimer.current !== null) {
          window.clearTimeout(reconnectTimer.current);
        }
      };
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (!wsConnected) {
      setTransientError("Not connected. Your changes will not be saved until connection is restored.");
      return;
    }

    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          content: { text: newContent }
        }));
      }
    } catch (error) {
      setTransientError("Failed to send update. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-gray-500">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Document not found</h2>
          <p className="mt-2 text-gray-600">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                     text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 
                     hover:bg-indigo-200 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const isOwner = document.owner.id === user?.id;
  const collaborator = document.collaborators.find(collaborator => collaborator.user.id === user?.id);
  const hasViewPermission = !isOwner && collaborator?.permission === 'VIEW';
  const hasAdminPermission = isOwner || collaborator?.permission === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span>Owner: {document.owner.username}</span>
                  <span className="mx-2">•</span>
                  <span>Last updated: {new Date(document.updated_at).toLocaleString()}</span>
                  {!wsConnected && (
                    <span className="ml-2 text-red-500">⚠️ Disconnected</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 
                         rounded-md shadow-sm text-sm font-medium text-gray-700 
                         bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Documents
              </button>
            </div>
          </div>

          {(transientError || connectionError) && (
            <div className="px-4 py-3 animate-fade-in">
              <div className={`rounded-md p-4 ${connectionError ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <p className={`text-sm ${connectionError ? 'text-red-700' : 'text-yellow-700'}`}>
                  {connectionError || transientError}
                </p>
              </div>
            </div>
          )}

          <div className="px-4 py-5 sm:p-6 space-y-6">
            <textarea
              value={content}
              onChange={handleChange}
              className="w-full h-[calc(100vh-300px)] p-4 border border-gray-300 
                       rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                       sm:text-sm font-mono resize-none"
              placeholder="Start typing your document content..."
              disabled={hasViewPermission}
            />

            {hasAdminPermission && (
              <CollaboratorManagement documentId={Number(id)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
