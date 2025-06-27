export interface ApiLoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    is_admin: boolean;
    avatar_url?: string;
  };
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
