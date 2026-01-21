import { describe, it, expect } from 'vitest';
import { getGreeting, getAllExamples } from './example.service';

describe('ExampleService', () => {
  describe('getGreeting', () => {
    it('should return a greeting message', () => {
      const result = getGreeting({ name: 'World' });
      expect(result).toBe('Hello, World!');
    });

    it('should handle different names', () => {
      const result = getGreeting({ name: 'Alice' });
      expect(result).toBe('Hello, Alice!');
    });
  });

  describe('getAllExamples', () => {
    it('should return all examples', () => {
      const result = getAllExamples();
      expect(result).toEqual([
        { id: 1, name: 'Example 1' },
        { id: 2, name: 'Example 2' },
      ]);
    });
  });
});
