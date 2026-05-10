import { nanoid } from 'nanoid';

export function getUid(): string {
  const key = 'doings_uid';
  let uid = localStorage.getItem(key);
  if (!uid) {
    uid = nanoid();
    localStorage.setItem(key, uid);
  }
  return uid;
}
