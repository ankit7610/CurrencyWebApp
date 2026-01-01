import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface CurrencyCacheDB extends DBSchema {
    responses: {
        key: string;
        value: {
            url: string;
            body: any; // For POST requests
            response: any;
            timestamp: number;
        };
    };
}

const DB_NAME = 'currency-app-cache';
const STORE_NAME = 'responses';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

class CacheService {
    private dbPromise: Promise<IDBPDatabase<CurrencyCacheDB>>;

    constructor() {
        this.dbPromise = openDB<CurrencyCacheDB>(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                }
            },
        });
    }

    /**
     * generateCacheKey creation logic
     * For GET requests, the URL is the key.
     * For POST requests, we append a hash of the body to the URL.
     */
    private generateCacheKey(url: string, body?: any): string {
        if (!body) return url;
        return `${url}::${JSON.stringify(body)}`;
    }

    async getResponse(url: string, body?: any): Promise<any | null> {
        const db = await this.dbPromise;
        const key = this.generateCacheKey(url, body);
        const cachedItem = await db.get(STORE_NAME, key);

        if (!cachedItem) return null;

        const now = Date.now();
        if (now - cachedItem.timestamp > CACHE_TTL_MS) {
            // Cache expired, delete it
            await db.delete(STORE_NAME, key);
            return null;
        }

        console.log(`[Cache Hit] Serving from IndexedDB: ${key}`);
        return cachedItem.response;
    }

    async saveResponse(url: string, response: any, body?: any): Promise<void> {
        const db = await this.dbPromise;
        const key = this.generateCacheKey(url, body);

        await db.put(STORE_NAME, {
            url: key, // Using the generated key as the 'url' field for IDB keyPath
            body,
            response,
            timestamp: Date.now(),
        });
        console.log(`[Cache Saved] Saved to IndexedDB: ${key}`);
    }

    async clearCache(): Promise<void> {
        const db = await this.dbPromise;
        await db.clear(STORE_NAME);
    }
}

export const cacheService = new CacheService();
