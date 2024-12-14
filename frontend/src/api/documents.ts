import api from './axios';
import { Document } from '../types/document';

export const documentApi = {
  getDocuments: () => 
    api.get<Document[]>('/documents/'),

  getDocument: (id: number) =>
    api.get<Document>(`/documents/${id}/`),

  createDocument: (title: string) =>
    api.post<Document>('/documents/', { title, content: { text: '' } }),

  updateDocument: (id: number, content: { text: string }) =>
    api.patch<Document>(`/documents/${id}/`, { content }),

  addCollaborator: (documentId: number, username: string, permission: string) =>
    api.post(`/documents/${documentId}/add_collaborator/`, {
      username,
      permission
    }),

  getCollaborators: (documentId: number) =>
    api.get(`/documents/${documentId}/collaborators/`),
  
  removeCollaborator: (documentId: number, username: string) =>
    api.post(`/documents/${documentId}/remove_collaborator/`, {
      username
    })
};
