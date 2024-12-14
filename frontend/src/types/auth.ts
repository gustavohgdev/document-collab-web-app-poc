export interface User {
    id: number;
    username: string;
    email: string;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  