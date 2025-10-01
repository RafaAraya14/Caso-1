/**
 * Tests for objectUtils utilities
 */

import { ObjectUtils, deepClone, deepMerge } from './objectUtils';

describe('ObjectUtils', () => {
  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ObjectUtils.getInstance();
      const instance2 = ObjectUtils.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
  });

  it('should clone dates', () => {
    const originalDate = new Date('2023-12-15');
    const clonedDate = deepClone(originalDate);

    expect(clonedDate).toBeInstanceOf(Date);
    expect(clonedDate.getTime()).toBe(originalDate.getTime());
    expect(clonedDate).not.toBe(originalDate); // Different reference
  });

  it('should clone arrays', () => {
    const originalArray = [1, 2, [3, 4], 'hello'];
    const clonedArray = deepClone(originalArray);

    expect(clonedArray).toEqual(originalArray);
    expect(clonedArray).not.toBe(originalArray); // Different reference
    expect(clonedArray[2]).not.toBe(originalArray[2]); // Nested array also cloned
  });

  it('should clone nested arrays', () => {
    const originalArray = [1, [2, [3, 4]]];
    const clonedArray = deepClone(originalArray);

    expect(clonedArray).toEqual(originalArray);
    expect(clonedArray[1]).not.toBe(originalArray[1]);
    expect((clonedArray[1] as any)[1]).not.toBe((originalArray[1] as any)[1]);
  });

  it('should clone simple objects', () => {
    const originalObj = { name: 'John', age: 30 };
    const clonedObj = deepClone(originalObj);

    expect(clonedObj).toEqual(originalObj);
    expect(clonedObj).not.toBe(originalObj); // Different reference
  });

  it('should clone nested objects', () => {
    const originalObj = {
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Boston',
      },
      hobbies: ['reading', 'coding'],
    };
    const clonedObj = deepClone(originalObj);

    expect(clonedObj).toEqual(originalObj);
    expect(clonedObj).not.toBe(originalObj);
    expect(clonedObj.address).not.toBe(originalObj.address);
    expect(clonedObj.hobbies).not.toBe(originalObj.hobbies);
  });

  it('should handle circular references gracefully', () => {
    const obj: any = { name: 'test' };
    obj.self = obj; // Circular reference

    // This should not throw an error, though implementation may vary
    expect(() => deepClone(obj)).not.toThrow();
  });

  it('should clone complex nested structures', () => {
    const complexObj = {
      id: 1,
      user: {
        name: 'John',
        profile: {
          email: 'john@test.com',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      },
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2', meta: { tags: ['tag1', 'tag2'] } },
      ],
      createdAt: new Date('2023-12-15'),
    };

    const cloned = deepClone(complexObj);

    expect(cloned).toEqual(complexObj);
    expect(cloned.user.profile.settings).not.toBe(complexObj.user.profile.settings);
    expect(cloned.items[1]?.meta?.tags).not.toBe(complexObj.items[1]?.meta?.tags);
    expect(cloned.createdAt).not.toBe(complexObj.createdAt);
  });
});

describe('deepMerge', () => {
  it('should merge simple objects', () => {
    const target = { a: 1, b: 2 };
    const source = { c: 3, d: 4 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('should override properties from source', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge nested objects', () => {
    const target = {
      user: { name: 'John', age: 30 },
      settings: { theme: 'light' },
    };
    const source = {
      user: { email: 'john@test.com' },
      settings: { notifications: true },
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      user: { name: 'John', age: 30, email: 'john@test.com' },
      settings: { theme: 'light', notifications: true },
    });
  });

  it('should handle arrays by replacing them', () => {
    const target = { items: [1, 2, 3] };
    const source = { items: [4, 5] };
    const result = deepMerge(target, source);

    expect(result.items).toEqual([4, 5]);
  });

  it('should preserve original objects', () => {
    const target = { a: 1, nested: { b: 2 } };
    const source = { c: 3, nested: { d: 4 } };

    deepMerge(target, source);

    // Original objects should be unchanged
    expect(target).toEqual({ a: 1, nested: { b: 2 } });
    expect(source).toEqual({ c: 3, nested: { d: 4 } });
  });

  it('should handle empty objects', () => {
    expect(deepMerge({}, {})).toEqual({});

    const target = { a: 1 };
    expect(deepMerge(target, {})).toEqual({ a: 1 });

    const source = { b: 2 };
    expect(deepMerge({}, source)).toEqual({ b: 2 });
  });

  it('should handle complex nested merging', () => {
    const target = {
      config: {
        database: {
          host: 'localhost',
          port: 5432,
        },
        cache: {
          enabled: true,
        },
      },
      features: ['auth'],
    };

    const source = {
      config: {
        database: {
          password: 'secret',
        },
        logging: {
          level: 'info',
        },
      },
      features: ['payments', 'notifications'],
    };

    const result = deepMerge(target, source);

    expect(result).toEqual({
      config: {
        database: {
          host: 'localhost',
          port: 5432,
          password: 'secret',
        },
        cache: {
          enabled: true,
        },
        logging: {
          level: 'info',
        },
      },
      features: ['payments', 'notifications'],
    });
  });
});
