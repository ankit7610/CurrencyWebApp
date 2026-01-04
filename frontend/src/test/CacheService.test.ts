import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { cacheService } from '../services/CacheService';

describe('CacheService', () => {
  beforeEach(() => {
    // Reset IndexedDB before each test
    global.indexedDB = new IDBFactory();
  });

  afterEach(async () => {
    // Clear cache after each test
    await cacheService.clearCache();
  });

  describe('getResponse', () => {
    it('returns null when cache is empty', async () => {
      const result = await cacheService.getResponse('/api/currencies');
      expect(result).toBeNull();
    });

    it('returns cached response when available', async () => {
      const url = '/api/currencies';
      const data = { currencies: { USD: 1.0, EUR: 0.85 } };
      
      await cacheService.saveResponse(url, data);
      const result = await cacheService.getResponse(url);
      
      expect(result).toEqual(data);
    });

    it('returns null for expired cache', async () => {
      const url = '/api/currencies';
      const data = { currencies: { USD: 1.0 } };
      
      // Save response with a timestamp far in the past
      await cacheService.saveResponse(url, data);
      
      // Mock Date.now to simulate cache expiration (6 hours + 1ms)
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + (6 * 60 * 60 * 1000) + 1);
      
      const result = await cacheService.getResponse(url);
      
      expect(result).toBeNull();
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('handles POST request caching with body', async () => {
      const url = '/api/convert';
      const body = { from: 'USD', to: 'EUR', amount: 100 };
      const data = { convertedAmount: 85, rate: 0.85 };
      
      await cacheService.saveResponse(url, data, body);
      const result = await cacheService.getResponse(url, body);
      
      expect(result).toEqual(data);
    });

    it('returns null for different request body', async () => {
      const url = '/api/convert';
      const body1 = { from: 'USD', to: 'EUR', amount: 100 };
      const body2 = { from: 'USD', to: 'GBP', amount: 100 };
      const data = { convertedAmount: 85, rate: 0.85 };
      
      await cacheService.saveResponse(url, data, body1);
      const result = await cacheService.getResponse(url, body2);
      
      expect(result).toBeNull();
    });
  });

  describe('saveResponse', () => {
    it('successfully saves a response', async () => {
      const url = '/api/currencies';
      const data = { currencies: { USD: 1.0, EUR: 0.85 } };
      
      await cacheService.saveResponse(url, data);
      const result = await cacheService.getResponse(url);
      
      expect(result).toEqual(data);
    });

    it('overwrites existing cache for same key', async () => {
      const url = '/api/currencies';
      const oldData = { currencies: { USD: 1.0 } };
      const newData = { currencies: { USD: 1.0, EUR: 0.85, GBP: 0.73 } };
      
      await cacheService.saveResponse(url, oldData);
      await cacheService.saveResponse(url, newData);
      
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(newData);
    });

    it('saves multiple different responses', async () => {
      const url1 = '/api/currencies';
      const url2 = '/api/rates';
      const data1 = { currencies: { USD: 1.0 } };
      const data2 = { rates: { EUR: 0.85 } };
      
      await cacheService.saveResponse(url1, data1);
      await cacheService.saveResponse(url2, data2);
      
      expect(await cacheService.getResponse(url1)).toEqual(data1);
      expect(await cacheService.getResponse(url2)).toEqual(data2);
    });

    it('saves responses with request body', async () => {
      const url = '/api/convert';
      const body = { from: 'USD', to: 'EUR', amount: 100 };
      const data = { convertedAmount: 85 };
      
      await cacheService.saveResponse(url, data, body);
      const result = await cacheService.getResponse(url, body);
      
      expect(result).toEqual(data);
    });
  });

  describe('clearCache', () => {
    it('clears all cached responses', async () => {
      const url1 = '/api/currencies';
      const url2 = '/api/rates';
      const data1 = { currencies: { USD: 1.0 } };
      const data2 = { rates: { EUR: 0.85 } };
      
      await cacheService.saveResponse(url1, data1);
      await cacheService.saveResponse(url2, data2);
      
      await cacheService.clearCache();
      
      expect(await cacheService.getResponse(url1)).toBeNull();
      expect(await cacheService.getResponse(url2)).toBeNull();
    });

    it('can save new responses after clearing', async () => {
      const url = '/api/currencies';
      const oldData = { currencies: { USD: 1.0 } };
      const newData = { currencies: { EUR: 0.85 } };
      
      await cacheService.saveResponse(url, oldData);
      await cacheService.clearCache();
      await cacheService.saveResponse(url, newData);
      
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(newData);
    });
  });

  describe('cache key generation', () => {
    it('generates different keys for GET and POST with same URL', async () => {
      const url = '/api/data';
      const getData = { type: 'get' };
      const postBody = { param: 'value' };
      const postData = { type: 'post' };
      
      await cacheService.saveResponse(url, getData);
      await cacheService.saveResponse(url, postData, postBody);
      
      const getResult = await cacheService.getResponse(url);
      const postResult = await cacheService.getResponse(url, postBody);
      
      expect(getResult).toEqual(getData);
      expect(postResult).toEqual(postData);
    });

    it('generates different keys for different request bodies', async () => {
      const url = '/api/convert';
      const body1 = { from: 'USD', to: 'EUR', amount: 100 };
      const body2 = { from: 'EUR', to: 'USD', amount: 100 };
      const data1 = { result: 'first' };
      const data2 = { result: 'second' };
      
      await cacheService.saveResponse(url, data1, body1);
      await cacheService.saveResponse(url, data2, body2);
      
      expect(await cacheService.getResponse(url, body1)).toEqual(data1);
      expect(await cacheService.getResponse(url, body2)).toEqual(data2);
    });
  });

  describe('cache TTL behavior', () => {
    it('returns cached response within TTL window', async () => {
      const url = '/api/currencies';
      const data = { currencies: { USD: 1.0 } };
      
      await cacheService.saveResponse(url, data);
      
      // Mock time advancement by 5 hours (within 6 hour TTL)
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + (5 * 60 * 60 * 1000));
      
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(data);
      
      Date.now = originalDateNow;
    });

    it('deletes expired cache when accessed', async () => {
      const url = '/api/currencies';
      const data = { currencies: { USD: 1.0 } };
      
      await cacheService.saveResponse(url, data);
      
      // Mock time advancement beyond TTL
      const originalDateNow = Date.now;
      Date.now = vi.fn(() => originalDateNow() + (7 * 60 * 60 * 1000));
      
      const result = await cacheService.getResponse(url);
      expect(result).toBeNull();
      
      // Restore and verify cache was deleted
      Date.now = originalDateNow;
      const resultAfterRestore = await cacheService.getResponse(url);
      expect(resultAfterRestore).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles null response data', async () => {
      const url = '/api/null-data';
      await cacheService.saveResponse(url, null);
      const result = await cacheService.getResponse(url);
      expect(result).toBeNull();
    });

    it('handles undefined response data', async () => {
      const url = '/api/undefined-data';
      await cacheService.saveResponse(url, undefined);
      const result = await cacheService.getResponse(url);
      expect(result).toBeUndefined();
    });

    it('handles complex nested objects', async () => {
      const url = '/api/complex';
      const complexData = {
        nested: {
          deeply: {
            nested: {
              value: 'test',
              array: [1, 2, 3],
              object: { key: 'value' }
            }
          }
        }
      };
      
      await cacheService.saveResponse(url, complexData);
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(complexData);
    });

    it('handles special characters in URLs', async () => {
      const url = '/api/data?param=value&special=!@#$%';
      const data = { test: 'data' };
      
      await cacheService.saveResponse(url, data);
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(data);
    });

    it('handles large data objects', async () => {
      const url = '/api/large-data';
      const largeData = {
        currencies: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`CUR${i}`, Math.random()])
        )
      };
      
      await cacheService.saveResponse(url, largeData);
      const result = await cacheService.getResponse(url);
      expect(result).toEqual(largeData);
    });
  });
});
