const DAILY_LIMIT = 2 * 1024 * 1024 * 1024;
let uploadBytes = 0;
let downloadBytes = 0;
let resetTimer: ReturnType<typeof setInterval> | null = null;

export function initBandwidth() {
  if (resetTimer) return;
  resetTimer = setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      uploadBytes = 0;
      downloadBytes = 0;
    }
  }, 60000);
}

export function addUpload(bytes: number) {
  uploadBytes += bytes;
}

export function addDownload(bytes: number) {
  downloadBytes += bytes;
}

export function isExceeded(): boolean {
  return uploadBytes + downloadBytes > DAILY_LIMIT;
}

export function getStatus() {
  return {
    uploadBytes,
    downloadBytes,
    totalBytes: uploadBytes + downloadBytes,
    limit: DAILY_LIMIT,
    isExceeded: uploadBytes + downloadBytes > DAILY_LIMIT
  };
}
