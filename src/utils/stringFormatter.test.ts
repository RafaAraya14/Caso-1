import {
  camelCase,
  capitalize,
  escapeHtml,
  extractInitials,
  formatCoachName,
  generateSlug,
  highlightText,
  kebabCase,
  maskEmail,
  maskPhone,
  pascalCase,
  pluralize,
  readingTime,
  removeAccents,
  similarity,
  singularize,
  snakeCase,
  stripHtml,
  truncate,
  unescapeHtml,
  validateEmail,
  validatePhone,
  wordCount,
} from './stringFormatter';

describe('StringFormatter', () => {
  describe('Case conversions', () => {
    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello world')).toBe('Hello world');
      });

      it('should handle empty string', () => {
        expect(capitalize('')).toBe('');
      });

      it('should handle single character', () => {
        expect(capitalize('a')).toBe('A');
      });
    });

    describe('camelCase', () => {
      it('should convert to camelCase', () => {
        expect(camelCase('hello world')).toBe('helloWorld');
        expect(camelCase('hello-world')).toBe('helloWorld');
        expect(camelCase('hello_world')).toBe('helloWorld');
      });
    });

    describe('pascalCase', () => {
      it('should convert to PascalCase', () => {
        expect(pascalCase('hello world')).toBe('HelloWorld');
        expect(pascalCase('hello-world')).toBe('HelloWorld');
      });
    });

    describe('kebabCase', () => {
      it('should convert to kebab-case', () => {
        expect(kebabCase('Hello World')).toBe('hello-world');
        expect(kebabCase('helloWorld')).toBe('hello-world');
      });
    });

    describe('snakeCase', () => {
      it('should convert to snake_case', () => {
        expect(snakeCase('Hello World')).toBe('hello_world');
        expect(snakeCase('helloWorld')).toBe('hello_world');
      });
    });
  });

  describe('Text manipulation', () => {
    describe('generateSlug', () => {
      it('should create URL-friendly slug', () => {
        expect(generateSlug('Hello World!')).toBe('hello-world');
      });

      it('should handle special characters', () => {
        expect(generateSlug('Café & Restaurant')).toBe('cafe-restaurant');
      });
    });

    describe('truncate', () => {
      it('should truncate text to specified length', () => {
        const text = 'This is a very long text that should be truncated';
        expect(truncate(text, 20)).toBe('This is a very lo...');
      });

      it('should not truncate if text is shorter', () => {
        expect(truncate('Short text', 20)).toBe('Short text');
      });

      it('should use custom suffix', () => {
        expect(truncate('Long text here', 16, ' [more]')).toBe('Long tex [more]');
      });
    });

    describe('stripHtml', () => {
      it('should remove HTML tags', () => {
        expect(stripHtml('<p>Hello <strong>world</strong>!</p>')).toBe('Hello world!');
      });

      it('should handle nested tags', () => {
        expect(stripHtml('<div><p>Text</p></div>')).toBe('Text');
      });
    });

    describe('escapeHtml', () => {
      it('should escape HTML characters', () => {
        expect(escapeHtml('<div>"Hello" & \'world\'</div>')).toBe(
          '&lt;div&gt;&quot;Hello&quot; &amp; &#x27;world&#x27;&lt;/div&gt;'
        );
      });
    });

    describe('unescapeHtml', () => {
      it('should unescape HTML entities', () => {
        expect(
          unescapeHtml('&lt;div&gt;&quot;Hello&quot; &amp; &#x27;world&#x27;&lt;/div&gt;')
        ).toBe('<div>"Hello" & \'world\'</div>');
      });
    });

    describe('removeAccents', () => {
      it('should remove accents from text', () => {
        expect(removeAccents('Café résumé naïve')).toBe('Cafe resume naive');
      });

      it('should handle various accents', () => {
        expect(removeAccents('àáâãäåæçèéêë')).toBe('aaaaaaaeeeee');
      });
    });

    describe('highlightText', () => {
      it('should highlight search terms', () => {
        const result = highlightText('Hello world', 'world');
        expect(result).toContain('<mark>');
        expect(result).toContain('world');
      });
    });
  });

  describe('Validation', () => {
    describe('validateEmail', () => {
      it('should validate email addresses', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@domain.com')).toBe(false);
      });
    });

    describe('validatePhone', () => {
      it('should validate phone numbers', () => {
        expect(validatePhone('+1234567890')).toBe(true);
        expect(validatePhone('123-456-7890')).toBe(true);
        expect(validatePhone('abc123')).toBe(false);
      });
    });
  });

  describe('Masking functions', () => {
    describe('maskEmail', () => {
      it('should mask email addresses', () => {
        const masked = maskEmail('user@example.com');
        expect(masked).toContain('*');
        expect(masked).toContain('@');
      });
    });

    describe('maskPhone', () => {
      it('should mask phone numbers', () => {
        const masked = maskPhone('1234567890');
        expect(masked).toContain('*');
        expect(masked.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Text utilities', () => {
    describe('extractInitials', () => {
      it('should extract initials from name', () => {
        expect(extractInitials('John Doe')).toBe('JD');
        expect(extractInitials('John Michael Doe', 3)).toBe('JMD');
      });
    });

    describe('pluralize', () => {
      it('should pluralize words', () => {
        expect(pluralize('coach', 2)).toBe('coaches');
        expect(pluralize('coach', 1)).toBe('coach');
      });

      it('should handle different locales', () => {
        expect(pluralize('gato', 2, 'es')).toBe('gatos');
      });
    });

    describe('singularize', () => {
      it('should singularize words', () => {
        expect(singularize('coaches')).toBe('coach');
        expect(singularize('gatos', 'es')).toBe('gato');
      });
    });

    describe('similarity', () => {
      it('should calculate string similarity', () => {
        expect(similarity('hello', 'hello')).toBe(1);
        expect(similarity('hello', 'hallo')).toBeGreaterThan(0.5);
        expect(similarity('hello', 'world')).toBeLessThan(0.5);
        expect(similarity('', '')).toBe(1);
      });
    });

    describe('formatCoachName', () => {
      it('should format coach names', () => {
        expect(formatCoachName('John', 'Doe')).toBe('John Doe');
        expect(formatCoachName('María', 'García')).toBe('María García');
      });
    });

    describe('wordCount', () => {
      it('should count words in text', () => {
        expect(wordCount('Hello world')).toBe(2);
        expect(wordCount('This is a test sentence')).toBe(5);
        expect(wordCount('')).toBe(0);
        expect(wordCount('   ')).toBe(0);
      });
    });

    describe('readingTime', () => {
      it('should calculate reading time', () => {
        const text = 'word '.repeat(200); // 200 words
        const time = readingTime(text);
        expect(time).toBeGreaterThan(0);
        expect(typeof time).toBe('number');
      });

      it('should handle custom WPM', () => {
        const text = 'word '.repeat(100);
        const time = readingTime(text, 100);
        expect(time).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings gracefully', () => {
      expect(capitalize('')).toBe('');
      expect(generateSlug('')).toBe('');
      expect(wordCount('')).toBe(0);
    });

    it('should handle special characters', () => {
      expect(removeAccents('àáâãäåæçèéêë')).toBe('aaaaaaaeeeee');
      expect(stripHtml('<script>alert("test")</script>')).toBe('alert("test")');
    });

    it('should validate edge case inputs', () => {
      expect(validateEmail('')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });
});
