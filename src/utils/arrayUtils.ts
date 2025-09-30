/**
 * Array Utilities
 *
 * Conjunto completo de utilidades para manipulación y análisis de arrays.
 * Incluye operaciones funcionales, estadísticas y transformaciones.
 */

export type SortOrder = 'asc' | 'desc';

export class ArrayUtils {
  private static instance: ArrayUtils;

  private constructor() {}

  public static getInstance(): ArrayUtils {
    if (!ArrayUtils.instance) {
      ArrayUtils.instance = new ArrayUtils();
    }
    return ArrayUtils.instance;
  }
}

// Agrupación y organización

export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item).toString();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

export const sortBy = <T>(array: T[], keyFn: (item: T) => any, order: SortOrder = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);

    if (aVal < bVal) {
      return order === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const filterBy = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  return array.filter(predicate);
};

export const unique = <T>(array: T[], keyFn?: (item: T) => any): T[] => {
  if (!keyFn) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Manipulación de estructura

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

export const intersection = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter(item => arr2.includes(item));
};

export const difference = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter(item => !arr2.includes(item));
};

// Operaciones aleatorias

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sample = <T>(array: T[], count: number = 1): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
};

// Análisis y partición

export const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach(item => {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  });

  return [pass, fail];
};

export const pluck = <T, K extends keyof T>(array: T[], key: K): T[K][] => {
  return array.map(item => item[key]);
};

// Estadísticas

export const sum = (array: number[]): number => {
  return array.reduce((total, num) => total + num, 0);
};

export const average = (array: number[]): number => {
  return array.length > 0 ? sum(array) / array.length : 0;
};

export const median = (array: number[]): number => {
  if (array.length === 0) {
    return 0;
  }

  const sorted = [...array].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

export const mode = (array: number[]): number[] => {
  const frequency = new Map<number, number>();
  let maxFreq = 0;

  array.forEach(num => {
    const freq = (frequency.get(num) || 0) + 1;
    frequency.set(num, freq);
    maxFreq = Math.max(maxFreq, freq);
  });

  return Array.from(frequency.entries())
    .filter(([_, freq]) => freq === maxFreq)
    .map(([num, _]) => num);
};

// Utilidades específicas para la aplicación

export const sortCoachesByRating = <T extends { rating: number }>(coaches: T[]): T[] => {
  return sortBy(coaches, coach => coach.rating, 'desc');
};

export const filterAvailableCoaches = <T extends { isAvailable: boolean }>(coaches: T[]): T[] => {
  return filterBy(coaches, coach => coach.isAvailable);
};

export const groupSessionsByDate = <T extends { date: string }>(
  sessions: T[]
): Record<string, T[]> => {
  return groupBy(sessions, session => session.date.split('T')[0]);
};

export const getTopRatedCoaches = <T extends { rating: number }>(
  coaches: T[],
  count: number = 5
): T[] => {
  return sortCoachesByRating(coaches).slice(0, count);
};

export const searchCoaches = <T extends { name: string; skills: string[] }>(
  coaches: T[],
  query: string
): T[] => {
  const searchTerms = query.toLowerCase().split(' ');

  return coaches.filter(coach => {
    const searchableText = [
      coach.name.toLowerCase(),
      ...coach.skills.map(skill => skill.toLowerCase()),
    ].join(' ');

    return searchTerms.every(term => searchableText.includes(term));
  });
};
