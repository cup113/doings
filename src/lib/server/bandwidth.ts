const DAILY_LIMIT = 2 * 1024 * 1024 * 1024;
let uploadBytes = 0;
let downloadBytes = 0;
let lastResetDay = getCurrentDay();

function getCurrentDay(): number {
  return Math.floor(Date.now() / 86400000);
}

function maybeReset() {
  const today = getCurrentDay();
  if (today !== lastResetDay) {
    uploadBytes = 0;
    downloadBytes = 0;
    lastResetDay = today;
  }
}

export function addUpload(bytes: number) {
  maybeReset();
  uploadBytes += bytes;
}

export function addDownload(bytes: number) {
  maybeReset();
  downloadBytes += bytes;
}

export function isExceeded(): boolean {
  maybeReset();
  return uploadBytes + downloadBytes > DAILY_LIMIT;
}

export function getStatus() {
  maybeReset();
  return {
    uploadBytes,
    downloadBytes,
    totalBytes: uploadBytes + downloadBytes,
    limit: DAILY_LIMIT,
    isExceeded: uploadBytes + downloadBytes > DAILY_LIMIT
  };
}
