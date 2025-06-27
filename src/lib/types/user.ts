export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserInfo;
  token: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Type pour la mise à jour des informations utilisateur
export interface UserUpdateData {
  username?: string;
  email?: string;
  avatar_url?: string;
}
