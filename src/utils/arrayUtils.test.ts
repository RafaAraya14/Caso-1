import {
  average,
  chunk,
  difference,
  filterAvailableCoaches,
  filterBy,
  flatten,
  groupBy,
  intersection,
  median,
  mode,
  partition,
  pluck,
  sample,
  searchCoaches,
  shuffle,
  sortBy,
  sortCoachesByRating,
  sum,
  unique,
} from './arrayUtils';

describe('ArrayUtils', () => {
  describe('chunk', () => {
    it('should split array into chunks of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = chunk(array, 3);
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8],
      ]);
    });

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('should handle size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it('should handle size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates from array', () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should work with strings', () => {
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should work with custom key function', () => {
      const objects = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'Johnny' },
      ];
      const result = unique(objects, obj => obj.id);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('intersection', () => {
    it('should find common elements between arrays', () => {
      const result = intersection([1, 2, 3, 4], [3, 4, 5, 6]);
      expect(result).toEqual([3, 4]);
    });

    it('should return empty array when no intersection', () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });
  });

  describe('difference', () => {
    it('should find elements in first array but not in second', () => {
      const result = difference([1, 2, 3, 4], [3, 4, 5, 6]);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('groupBy', () => {
    it('should group objects by key function', () => {
      const people = [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = groupBy(people, person => person.age);
      expect(result[25]).toHaveLength(2);
      expect(result[30]).toHaveLength(1);
    });
  });

  describe('sortBy', () => {
    it('should sort array by key function', () => {
      const people = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const result = sortBy(people, person => person.age);
      expect(result[0].age).toBe(25);
      expect(result[1].age).toBe(30);
      expect(result[2].age).toBe(35);
    });

    it('should sort in descending order', () => {
      const numbers = [3, 1, 4, 1, 5];
      const result = sortBy(numbers, n => n, 'desc');
      expect(result).toEqual([5, 4, 3, 1, 1]);
    });
  });

  describe('filterBy', () => {
    it('should filter array by predicate', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = filterBy(numbers, n => n % 2 === 0);
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle([...original]);
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });

  describe('sample', () => {
    it('should return random sample of specified size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = sample(array, 3);
      expect(result).toHaveLength(3);
      result.forEach(item => {
        expect(array).toContain(item);
      });
    });

    it('should return entire array if sample size is larger', () => {
      const array = [1, 2, 3];
      const result = sample(array, 5);
      expect(result).toHaveLength(3);
    });
  });

  describe('flatten', () => {
    it('should flatten nested arrays', () => {
      const nested = [[1, 2], [3, 4], [5]];
      expect(flatten(nested)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle empty nested arrays', () => {
      expect(flatten([[], [1, 2], []])).toEqual([1, 2]);
    });

    it('should handle mixed array', () => {
      const mixed = [1, [2, 3], 4, [5]];
      expect(flatten(mixed)).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Math utilities', () => {
    describe('sum', () => {
      it('should calculate sum of numbers', () => {
        expect(sum([1, 2, 3, 4, 5])).toBe(15);
      });

      it('should handle empty array', () => {
        expect(sum([])).toBe(0);
      });
    });

    describe('average', () => {
      it('should calculate average', () => {
        expect(average([1, 2, 3, 4, 5])).toBe(3);
      });

      it('should handle decimal averages', () => {
        expect(average([1, 2, 3])).toBe(2);
      });
    });

    describe('median', () => {
      it('should calculate median for odd length array', () => {
        expect(median([1, 3, 5])).toBe(3);
      });

      it('should calculate median for even length array', () => {
        expect(median([1, 2, 3, 4])).toBe(2.5);
      });
    });

    describe('mode', () => {
      it('should find most frequent number', () => {
        expect(mode([1, 2, 2, 3, 2])).toEqual([2]);
      });

      it('should handle multiple modes', () => {
        const result = mode([1, 1, 2, 2, 3]);
        expect(result.sort()).toEqual([1, 2]);
      });
    });
  });

  describe('partition', () => {
    it('should partition array by predicate', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const [evens, odds] = partition(numbers, n => n % 2 === 0);
      expect(evens).toEqual([2, 4, 6]);
      expect(odds).toEqual([1, 3, 5]);
    });
  });

  describe('pluck', () => {
    it('should extract values from objects', () => {
      const people = [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 30 },
      ];
      expect(pluck(people, 'name')).toEqual(['John', 'Jane']);
      expect(pluck(people, 'age')).toEqual([25, 30]);
    });
  });

  describe('Coach-specific utilities', () => {
    const coaches = [
      { id: 1, name: 'John', rating: 4.5, isAvailable: true, skills: ['React', 'JavaScript'] },
      { id: 2, name: 'Jane', rating: 4.8, isAvailable: false, skills: ['Vue', 'TypeScript'] },
      { id: 3, name: 'Bob', rating: 4.2, isAvailable: true, skills: ['Angular', 'JavaScript'] },
    ];

    describe('sortCoachesByRating', () => {
      it('should sort coaches by rating in descending order', () => {
        const result = sortCoachesByRating(coaches);
        expect(result[0].rating).toBe(4.8);
        expect(result[1].rating).toBe(4.5);
        expect(result[2].rating).toBe(4.2);
      });
    });

    describe('filterAvailableCoaches', () => {
      it('should filter only available coaches', () => {
        const result = filterAvailableCoaches(coaches);
        expect(result).toHaveLength(2);
        expect(result.every(coach => coach.isAvailable)).toBe(true);
      });
    });

    describe('searchCoaches', () => {
      it('should search coaches by name', () => {
        const result = searchCoaches(coaches, 'John');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('John');
      });

      it('should search coaches by skills', () => {
        const result = searchCoaches(coaches, 'JavaScript');
        expect(result).toHaveLength(2);
      });

      it('should handle multiple search terms', () => {
        const result = searchCoaches(coaches, 'JavaScript React');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('John');
      });
    });
  });
});
