import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from './migrate';
import { SqliteImageRepository } from './SqliteImageRepository';

function makeRepo(): SqliteImageRepository {
  const db = new DatabaseSync(':memory:');
  migrate(db);
  return new SqliteImageRepository(db);
}

describe('SqliteImageRepository', () => {
  it('insertImage returns the created record with an id', () => {
    const repo = makeRepo();
    const r = repo.insertImage('uid1', 'uid1/test.webp', 'lobby');
    expect(r.id).toBeGreaterThan(0);
    expect(r.uid).toBe('uid1');
    expect(r.path).toBe('uid1/test.webp');
    expect(r.room).toBe('lobby');
    expect(r.created_at).toBeTruthy();
  });

  it('getImageById returns null for missing', () => {
    const repo = makeRepo();
    expect(repo.getImageById(999)).toBeNull();
  });

  it('getImageById returns the inserted record', () => {
    const repo = makeRepo();
    const r = repo.insertImage('uid1', 'uid1/test.webp', 'lobby');
    expect(repo.getImageById(r.id)).toEqual(r);
  });

  it('countImages returns total count', () => {
    const repo = makeRepo();
    repo.insertImage('uid1', 'p1', 'lobby');
    repo.insertImage('uid1', 'p2', 'lobby');
    repo.insertImage('uid2', 'p3', 'lobby');
    expect(repo.countImages({})).toBe(3);
  });

  it('countImages filters by uid', () => {
    const repo = makeRepo();
    repo.insertImage('uid1', 'p1', 'lobby');
    repo.insertImage('uid2', 'p2', 'lobby');
    expect(repo.countImages({ uid: 'uid1' })).toBe(1);
  });

  it('getImages returns newest first by default', () => {
    const repo = makeRepo();
    const r1 = repo.insertImage('uid1', 'p1', 'lobby');
    const r2 = repo.insertImage('uid1', 'p2', 'lobby');
    const results = repo.getImages({ uid: 'uid1', limit: 10 });
    expect(results.length).toBe(2);
    expect(results[0].id).toBe(r2.id);
    expect(results[1].id).toBe(r1.id);
  });

  it('getImages with oldest order', () => {
    const repo = makeRepo();
    const r1 = repo.insertImage('uid1', 'p1', 'lobby');
    const r2 = repo.insertImage('uid1', 'p2', 'lobby');
    const results = repo.getImages({ uid: 'uid1', order: 'oldest', limit: 10 });
    expect(results[0].id).toBe(r1.id);
    expect(results[1].id).toBe(r2.id);
  });

  it('getImages after cursor returns older items', () => {
    const repo = makeRepo();
    repo.insertImage('uid1', 'p1', 'lobby');
    const r2 = repo.insertImage('uid1', 'p2', 'lobby');
    const results = repo.getImages({ uid: 'uid1', after: r2.id, limit: 10 });
    expect(results.length).toBe(1);
    expect(results[0].id).toBeLessThan(r2.id);
  });

  it('deleteImage removes the row', () => {
    const repo = makeRepo();
    const r = repo.insertImage('uid1', 'p1', 'lobby');
    repo.deleteImage(r.id);
    expect(repo.getImageById(r.id)).toBeNull();
    expect(repo.countImages({})).toBe(0);
  });

  it('ping returns true', () => {
    const repo = makeRepo();
    expect(repo.ping()).toBe(true);
  });
});
