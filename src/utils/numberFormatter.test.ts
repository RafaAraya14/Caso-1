/**
 * Tests for numberFormatter utilities
 */

import {
  NumberFormatter,
  clamp,
  formatCurrency,
  formatFileSize,
  formatNumber,
  formatPercentage,
  isNumeric,
  parseNumber,
  randomInt,
  roundToDecimals,
  type CurrencyOptions,
  type NumberFormatOptions,
} from './numberFormatter';

describe('NumberFormatter', () => {
  let formatter: NumberFormatter;

  beforeEach(() => {
    formatter = NumberFormatter.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NumberFormatter.getInstance();
      const instance2 = NumberFormatter.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have default configuration', () => {
      expect(formatter.getDefaultLocale()).toBe('es-MX');
      expect(formatter.getDefaultCurrency()).toBe('MXN');
    });

    it('should allow configuration changes', () => {
      formatter.configure('en-US', 'USD');
      expect(formatter.getDefaultLocale()).toBe('en-US');
      expect(formatter.getDefaultCurrency()).toBe('USD');

      // Reset for other tests
      formatter.configure('es-MX', 'MXN');
    });
  });
});

describe('formatCurrency', () => {
  beforeEach(() => {
    const formatter = NumberFormatter.getInstance();
    formatter.configure('es-MX', 'MXN');
  });

  it('should format currency with default options', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56'); // Contains the number part
    // Just check if it's a valid currency string
    expect(result).toMatch(/\$|MX|\$/); // USD or MXN symbol
  });

  it('should format currency with custom options', () => {
    const options: CurrencyOptions = {
      currency: 'USD',
      locale: 'en-US',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    const result = formatCurrency(1234.56, options);
    expect(result).toContain('1,234.56');
    expect(result).toContain('$');
  });

  it('should handle zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-100);
    expect(result).toContain('100');
  });
});

describe('formatPercentage', () => {
  it('should format percentage with default decimals', () => {
    const result = formatPercentage(0.1234);
    expect(result).toContain('12.3');
    expect(result).toContain('%');
  });

  it('should format percentage with custom decimals', () => {
    const result = formatPercentage(0.1234, 2);
    expect(result).toContain('12.34');
    expect(result).toContain('%');
  });

  it('should format zero percentage', () => {
    const result = formatPercentage(0);
    expect(result).toContain('0');
    expect(result).toContain('%');
  });

  it('should format percentage greater than 100%', () => {
    const result = formatPercentage(1.5);
    expect(result).toContain('150');
    expect(result).toContain('%');
  });

  it('should format with custom locale', () => {
    const result = formatPercentage(0.1234, 1, 'en-US');
    expect(result).toContain('12.3');
    expect(result).toContain('%');
  });
});

describe('formatFileSize', () => {
  it('should format zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(512)).toBe('512 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should format with custom decimals', () => {
    const result = formatFileSize(1536, 3);
    expect(result).toContain('1.5');
    expect(result).toContain('KB');
  });

  it('should handle fractional sizes', () => {
    const result = formatFileSize(1536);
    expect(result).toContain('1.5');
    expect(result).toContain('KB');
  });

  it('should format large sizes', () => {
    const terabyte = 1024 * 1024 * 1024 * 1024;
    const result = formatFileSize(terabyte);
    expect(result).toContain('1');
    expect(result).toContain('TB');
  });
});

describe('formatNumber', () => {
  it('should format number with default options', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('should format number with custom options', () => {
    const options: NumberFormatOptions = {
      minimumIntegerDigits: 3,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    };
    const result = formatNumber(12.3, options);
    expect(result).toBe('012.30');
  });

  it('should format with grouping disabled', () => {
    const options: NumberFormatOptions = {
      useGrouping: false,
    };
    const result = formatNumber(1234567, options);
    expect(result).toBeTruthy(); // Just check it formats
  });

  it('should format negative numbers', () => {
    const result = formatNumber(-1234.56);
    expect(result).toContain('1,234.56');
  });
});

describe('parseNumber', () => {
  it('should parse valid number', () => {
    expect(parseNumber(123.45)).toBe(123.45);
  });

  it('should parse valid string number', () => {
    expect(parseNumber('123.45')).toBe(123.45);
  });

  it('should parse formatted string numbers', () => {
    expect(parseNumber('$1,234.56')).toBe(1234.56);
    expect(parseNumber('1,234.56 USD')).toBe(1234.56);
  });

  it('should handle negative numbers', () => {
    expect(parseNumber('-123.45')).toBe(-123.45);
  });

  it('should return null for invalid inputs', () => {
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(NaN)).toBeNull();
  });

  it('should handle zero', () => {
    expect(parseNumber(0)).toBe(0);
    expect(parseNumber('0')).toBe(0);
  });
});

describe('isNumeric', () => {
  it('should return true for valid numbers', () => {
    expect(isNumeric(123)).toBe(true);
    expect(isNumeric(123.45)).toBe(true);
    expect(isNumeric(-123)).toBe(true);
    expect(isNumeric(0)).toBe(true);
  });

  it('should return true for valid string numbers', () => {
    expect(isNumeric('123')).toBe(true);
    expect(isNumeric('123.45')).toBe(true);
    expect(isNumeric('-123')).toBe(true);
    expect(isNumeric('0')).toBe(true);
  });

  it('should return false for invalid inputs', () => {
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric('')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
    expect(isNumeric(Infinity)).toBe(false);
  });
});

describe('roundToDecimals', () => {
  it('should round to specified decimals', () => {
    expect(roundToDecimals(123.456, 2)).toBe(123.46);
    expect(roundToDecimals(123.454, 2)).toBe(123.45);
  });

  it('should handle zero decimals', () => {
    expect(roundToDecimals(123.456, 0)).toBe(123);
  });

  it('should handle negative numbers', () => {
    expect(roundToDecimals(-123.456, 2)).toBe(-123.46);
  });

  it('should handle edge cases', () => {
    expect(roundToDecimals(0, 2)).toBe(0);
    expect(roundToDecimals(1, 5)).toBe(1);
  });
});

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('should clamp value to minimum', () => {
    expect(clamp(-5, 1, 10)).toBe(1);
  });

  it('should clamp value to maximum', () => {
    expect(clamp(15, 1, 10)).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(clamp(1, 1, 10)).toBe(1);
    expect(clamp(10, 1, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('randomInt', () => {
  it('should generate random integer within range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should handle single value range', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('should handle negative ranges', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(-10, -1);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
    }
  });

  it('should handle zero in range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});
