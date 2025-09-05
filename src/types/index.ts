export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  qrCode: string;
  createdAt: Date;
  expiresAt: Date;
  isReceived: boolean;
  receiverName?: string;
  location?: string;
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
  location?: string;
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
  location?: string;
}

export interface GroupedPhotos {
  [date: string]: PhotoListItem[];
}
