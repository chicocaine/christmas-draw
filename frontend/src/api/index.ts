import api from './axios';

export interface User {
  name: string;
  username: string;
  password: string;
  is_admin?: boolean;
}

export interface LoginResponse {
  token: string;
  is_admin: boolean;
}

export interface AssignmentResponse {
  assigned_to: string;
  has_drawn: boolean;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },
};

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  is_admin: boolean;
  has_drawn: boolean;
  has_assignment: boolean;
}

export interface Assignment {
  giver: string;
  receiver: string;
}

// Admin API
export const adminAPI = {
  createUsers: async (users: User[]) => {
    const response = await api.post('/admin/create-users', { users });
    return response.data;
  },

  generateAssignments: async () => {
    const response = await api.post('/admin/generate-assignments');
    return response.data;
  },

  getUsers: async (): Promise<{ users: UserInfo[] }> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getAssignments: async (): Promise<{ assignments: Assignment[] }> => {
    const response = await api.get('/admin/assignments');
    return response.data;
  },

  changeUserPassword: async (userId: number, newPassword: string) => {
    const response = await api.put(`/admin/users/${userId}/password`, { new_password: newPassword });
    return response.data;
  },
};

// User API
export const userAPI = {
  getAssignment: async (): Promise<AssignmentResponse> => {
    const response = await api.get<AssignmentResponse>('/user/assignment');
    return response.data;
  },

  getAllUsers: async (): Promise<{ users: UserInfo[] }> => {
    const response = await api.get('/user/all-users');
    return response.data;
  },

  markAssignmentViewed: async () => {
    const response = await api.post('/user/mark-viewed');
    return response.data;
  },
};
