export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  qrCode: string;
  createdAt: Date;
  expiresAt: Date;
  isReceived: boolean;
  receiverName?: string;
  receivedAt?: Date;
  location?: Location;
}

export interface CreatePhotoRequest {
  userId: string;
  imageBlob: Blob;
}

export interface CreatePhotoResponse {
  success: boolean;
  photoId: string;
  qrCode: string;
  error?: string;
}

export interface ReceivePhotoRequest {
  photoId: string;
  receiverName: string;
  location?: Location;
}

export interface ReceivePhotoResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface QRScanResult {
  photoId: string;
  isValid: boolean;
  isExpired: boolean;
  isAlreadyReceived: boolean;
}

export interface PhotoListItem {
  id: string;
  imageUrl: string;
  createdAt: Date;
  isReceived: boolean;
  receiverName?: string;
  receivedAt?: Date;
  location?: Location;
}

export interface GroupedPhotos {
  [date: string]: PhotoListItem[];
}

// User関連の型定義
export interface User {
  id: string;
  email: string;
  handle_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserStatsResponse {
  totalPhotos: number;
  receivedPhotos: number;
  unreceivedPhotos: number;
}
