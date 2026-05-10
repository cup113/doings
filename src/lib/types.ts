export interface ImageRecord {
  id: number;
  uid: string;
  path: string;
  created_at: string;
}

export interface BandwidthStatus {
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  limit: number;
  isExceeded: boolean;
}
