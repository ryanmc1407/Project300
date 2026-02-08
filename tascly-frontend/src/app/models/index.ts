// This file contains all my TypeScript interfaces and types
// I'm keeping them in one place so I can reuse them across the app

// This represents a user in my system
export interface User {
  id: number;
  username: string;
  email: string;
}

// This is what I send to the backend when registering
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// This is what I send when logging in
export interface LoginRequest {
  email: string;
  password: string;
}

// This is what the backend sends back after successful login/register
// It contains both the access token and refresh token
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  userId: number; // User ID from backend
}

// This is what I send when refreshing the access token
export interface RefreshTokenRequest {
  refreshToken: string;
}

// This represents a project in the system
export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: Date;
  userRole?: string; // Role of the current user in this project
}

// This is what I send when creating a new project
export interface CreateProjectRequest {
  name: string;
  description?: string;
}
