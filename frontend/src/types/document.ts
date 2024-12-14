export interface Document {
    id: number;
    title: string;
    content: {
      text: string;
    };
    owner: {
      id: number;
      username: string;
      email: string;
    };
    collaborators: Array<{
      id: number;
      user: {
        id: number;
        username: string;
        email: string;
      };
      permission: 'VIEW' | 'EDIT' | 'ADMIN';
    }>;
    created_at: string;
    updated_at: string;
  }
  