/**
 * User and Google connection model definitions.
 */

export interface GoogleConnection {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email?: string;
  scope: string;
  connectedAt: string;
  syncToken?: string;
  watchChannelId?: string;
  watchResourceId?: string;
  watchExpiration?: number;
  lastSyncAt?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  googleConnection?: GoogleConnection;
}
