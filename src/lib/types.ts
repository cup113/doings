export interface ImageRecord {
  id: number;
  uid: string;
  path: string;
  room: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  is_public: number;
  created_at: string;
}

export interface BandwidthStatus {
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  limit: number;
  isExceeded: boolean;
}
