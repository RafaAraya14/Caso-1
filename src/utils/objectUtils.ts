/**
 * Object Utilities
 *
 * Conjunto completo de utilidades para manipulación de objetos.
 * Incluye clonado profundo, merge, transformaciones y navegación.
 */

export class ObjectUtils {
  private static instance: ObjectUtils;

  private constructor() {}

  public static getInstance(): ObjectUtils {
    if (!ObjectUtils.instance) {
      ObjectUtils.instance = new ObjectUtils();
    }
    return ObjectUtils.instance;
  }
}

// Clonado y merge

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
};

export const deepMerge = <T extends object, U extends object>(target: T, source: U): T & U => {
  const result = { ...target } as any;

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue as object, sourceValue as object);
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result;
};

// Selección y omisión

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj } as any;
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Aplanado y navegación

export const flattenObject = (obj: object, prefix: string = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value) && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

export const unflattenObject = (obj: Record<string, any>): object => {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;

  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
};

// Verificaciones

export const hasProperty = (obj: any, path: string): boolean => {
  return getNestedValue(obj, path) !== undefined;
};

export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) {
    return true;
  }
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  return false;
};

export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null) {
    return false;
  }
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== 'object') {
    return false;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => isEqual(obj1[key], obj2[key]));
};

// Transformaciones

export const transform = <T, U>(
  obj: T,
  transformer: (value: any, key: string) => U
): Record<string, U> => {
  const result: Record<string, U> = {};

  for (const [key, value] of Object.entries(obj as any)) {
    result[key] = transformer(value, key);
  }

  return result;
};

export const mapKeys = <T>(
  obj: Record<string, T>,
  keyMapper: (key: string) => string
): Record<string, T> => {
  const result: Record<string, T> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = keyMapper(key);
    result[newKey] = value;
  }

  return result;
};

export const mapValues = <T, U>(
  obj: Record<string, T>,
  valueMapper: (value: T, key: string) => U
): Record<string, U> => {
  const result: Record<string, U> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = valueMapper(value, key);
  }

  return result;
};

// Utilidades auxiliares

const isObject = (value: any): boolean => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Utilidades específicas para la aplicación

export const cleanEmptyFields = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (isObject(value)) {
        const cleanedNested = cleanEmptyFields(value);
        if (!isEmpty(cleanedNested)) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
};

export const sanitizeFormData = (formData: Record<string, any>): Record<string, any> => {
  return mapValues(formData, value => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
};

export const extractErrorMessages = (errors: Record<string, any>): string[] => {
  const messages: string[] = [];

  const extract = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        messages.push(value);
      } else if (isObject(value)) {
        extract(value, path);
      }
    }
  };

  extract(errors);
  return messages;
};
