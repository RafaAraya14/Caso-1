/**
 * Number Formatter Utilities
 *
 * Conjunto completo de utilidades para formateo y manipulación de números.
 * Incluye formateo de moneda, porcentajes, tamaños de archivo y validaciones.
 *
 * @pattern Utility Functions + Singleton (NumberFormatter)
 */

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface NumberFormatOptions {
  locale?: string;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Singleton NumberFormatter para configuración global
 */
export class NumberFormatter {
  private static instance: NumberFormatter;
  private defaultLocale: string = 'es-MX';
  private defaultCurrency: string = 'MXN';

  private constructor() {}

  public static getInstance(): NumberFormatter {
    if (!NumberFormatter.instance) {
      NumberFormatter.instance = new NumberFormatter();
    }
    return NumberFormatter.instance;
  }

  public configure(locale: string, currency: string): void {
    this.defaultLocale = locale;
    this.defaultCurrency = currency;
  }

  public getDefaultLocale(): string {
    return this.defaultLocale;
  }

  public getDefaultCurrency(): string {
    return this.defaultCurrency;
  }
}

// Formateo de moneda

export const formatCurrency = (amount: number, options: CurrencyOptions = {}): string => {
  const formatter = NumberFormatter.getInstance();
  const locale = options.locale || formatter.getDefaultLocale();
  const currency = options.currency || formatter.getDefaultCurrency();

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = 'es-MX'
): string => {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(value);
};

export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatNumber = (number: number, options: NumberFormatOptions = {}): string => {
  const formatter = NumberFormatter.getInstance();
  const locale = options.locale || formatter.getDefaultLocale();

  const formatOptions: Intl.NumberFormatOptions = {
    minimumIntegerDigits: options.minimumIntegerDigits,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
    useGrouping: options.useGrouping !== false,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(number);
};

// Parsing y validación

export const parseNumber = (value: string | number): number | null => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    // Remover caracteres de formato
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Operaciones matemáticas

export const roundToDecimals = (number: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
};

export const clamp = (number: number, min: number, max: number): number => {
  return Math.min(Math.max(number, min), max);
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  const random = Math.random() * (max - min) + min;
  return roundToDecimals(random, decimals);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utilidades de rangos y escalas

export const normalizeToRange = (
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
): number => {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
};

export const getPercentileRank = (value: number, data: number[]): number => {
  const sorted = [...data].sort((a, b) => a - b);
  const belowCount = sorted.filter(x => x < value).length;
  const equalCount = sorted.filter(x => x === value).length;

  return ((belowCount + equalCount / 2) / sorted.length) * 100;
};

export const calculateGrowthRate = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) {
    return newValue > 0 ? Infinity : 0;
  }
  return ((newValue - oldValue) / oldValue) * 100;
};

// Formateo específico para la aplicación

export const formatRating = (rating: number, maxRating: number = 5): string => {
  const clamped = clamp(rating, 0, maxRating);
  return clamped.toFixed(1);
};

export const formatCoachPrice = (hourlyRate: number, currency: string = 'MXN'): string => {
  return `${formatCurrency(hourlyRate, { currency })} / hora`;
};

export const formatSessionDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatCredits = (credits: number): string => {
  if (credits === 1) {
    return '1 crédito';
  }
  return `${formatNumber(credits)} créditos`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const kilometers = meters / 1000;
  return `${roundToDecimals(kilometers, 1)} km`;
};

// Cálculos estadísticos

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) {
    return 0;
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

export const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) {
    return 0;
  }

  const avg = calculateAverage(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);

  return Math.sqrt(avgSquaredDiff);
};

export const calculatePercentile = (numbers: number[], percentile: number): number => {
  if (numbers.length === 0) {
    return 0;
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);

  if (Math.floor(index) === index) {
    return sorted[index];
  }

  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

// Validaciones específicas

export const isValidRating = (rating: number, min: number = 0, max: number = 5): boolean => {
  return isNumeric(rating) && rating >= min && rating <= max;
};

export const isValidPrice = (price: number): boolean => {
  return isNumeric(price) && price >= 0 && price <= 100000; // Límite razonable
};

export const isValidCredits = (credits: number): boolean => {
  return Number.isInteger(credits) && credits >= 0;
};

export const isValidDuration = (minutes: number): boolean => {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 480; // Máximo 8 horas
};

// Formateo de métricas y KPIs

export const formatMetric = (
  value: number,
  type: 'count' | 'percentage' | 'currency' | 'time'
): string => {
  switch (type) {
    case 'count':
      return formatNumber(value, { maximumFractionDigits: 0 });
    case 'percentage':
      return formatPercentage(value / 100);
    case 'currency':
      return formatCurrency(value);
    case 'time':
      return formatSessionDuration(value);
    default:
      return value.toString();
  }
};

export const formatTrend = (
  current: number,
  previous: number
): { value: string; trend: 'up' | 'down' | 'neutral' } => {
  const growth = calculateGrowthRate(previous, current);
  const absGrowth = Math.abs(growth);

  let trend: 'up' | 'down' | 'neutral';
  if (absGrowth < 1) {
    trend = 'neutral';
  } else {
    trend = growth > 0 ? 'up' : 'down';
  }

  return {
    value: `${growth > 0 ? '+' : ''}${roundToDecimals(growth, 1)}%`,
    trend,
  };
};

export const formatCompactNumber = (number: number): string => {
  const abs = Math.abs(number);
  const sign = number < 0 ? '-' : '';

  if (abs >= 1e9) {
    return `${sign + roundToDecimals(abs / 1e9, 1)}B`;
  } else if (abs >= 1e6) {
    return `${sign + roundToDecimals(abs / 1e6, 1)}M`;
  } else if (abs >= 1e3) {
    return `${sign + roundToDecimals(abs / 1e3, 1)}K`;
  }

  return sign + abs.toString();
};

// Utilidades de conversión

export const convertCurrency = async (
  amount: number,
  _fromCurrency: string,
  _toCurrency: string
): Promise<number> => {
  // En una implementación real, esto haría una llamada a una API de exchange rates
  // Por ahora, retornamos el valor sin conversión
  console.warn('Currency conversion not implemented. Returning original amount.');
  return amount;
};

export const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  const conversions: Record<string, Record<string, number>> = {
    length: {
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.34,
    },
    weight: {
      g: 0.001,
      kg: 1,
      lb: 0.453592,
      oz: 0.0283495,
    },
    time: {
      sec: 1,
      min: 60,
      hour: 3600,
      day: 86400,
    },
  };
  for (const [, units] of Object.entries(conversions)) {
    if (fromUnit in units && toUnit in units) {
      const valueInBase = value * units[fromUnit];
      return valueInBase / units[toUnit];
    }
  }
  throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
};
