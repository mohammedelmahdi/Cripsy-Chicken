/**
 * Commercial-grade IndexedDB Wrapper (Phase 0 Foundation)
 * Designed for offline-first resilience. Caches crucial POS metadata
 * and manages the background sync queue with transactional safety.
 */

import { SyncQueueItem } from '../types';

const DB_NAME = 'cripsy_pos_local';
const DB_VERSION = 1;

export class LocalDatabase {
  private db: IDBDatabase | null = null;

  /**
   * Initializes and upgrades the IndexedDB structure.
   */
  public init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('IndexedDB failed to open'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline products cache
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }

        // Offline categories cache
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Offline and unsynced orders
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }

        // Active cash sessions
        if (!db.objectStoreNames.contains('cash_sessions')) {
          db.createObjectStore('cash_sessions', { keyPath: 'id' });
        }

        // Outbound Sync Queue for synchronization queue pattern
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database is not initialized. Call init() first.');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * General-purpose retrieval of all items in a store.
   */
  public getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          reject(new Error(`Failed to retrieve items from ${storeName}`));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * General-purpose upsert of an item.
   */
  public put<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.put(item);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to write item to ${storeName}`));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * General-purpose deletion of an item.
   */
  public delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Failed to delete item ${id} from ${storeName}`));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Enqueues an offline event to the sync_queue.
   * Leverages browser-safe client UUIDs to prevent cloud collisions.
   */
  public enqueueSync(
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: string,
    entityId: string,
    payload: any
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      operation,
      entity,
      entityId,
      payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };
    return this.put<SyncQueueItem>('sync_queue', queueItem);
  }

  /**
   * Pulls all items currently pending synchronization.
   */
  public getPendingSyncs(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>('sync_queue').then((items) =>
      items.filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
    );
  }
}

export const localDb = new LocalDatabase();
