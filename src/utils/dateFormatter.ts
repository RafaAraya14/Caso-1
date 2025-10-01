/**
 * Date Formatter Utilities
 *
 * Conjunto completo de utilidades para formateo y manipulación de fechas.
 * Incluye formateo localizado, cálculos de fechas y validaciones.
 *
 * @pattern Utility Functions + Singleton (DateFormatter)
 */

export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'custom';
export type TimeFormat = '12h' | '24h';

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  format?: DateFormat;
  includeTime?: boolean;
  timeFormat?: TimeFormat;
  customFormat?: Intl.DateTimeFormatOptions;
}

/**
 * Singleton DateFormatter para configuración global
 */
export class DateFormatter {
  private static instance: DateFormatter;
  private defaultLocale: string = 'es-ES';
  private defaultTimeZone: string = 'America/Mexico_City';

  private constructor() {}

  public static getInstance(): DateFormatter {
    if (!DateFormatter.instance) {
      DateFormatter.instance = new DateFormatter();
    }
    return DateFormatter.instance;
  }

  public configure(locale: string, timeZone: string): void {
    this.defaultLocale = locale;
    this.defaultTimeZone = timeZone;
  }

  public getDefaultLocale(): string {
    return this.defaultLocale;
  }

  public getDefaultTimeZone(): string {
    return this.defaultTimeZone;
  }

  public format(date: Date | string | number, options: DateFormatOptions = {}): string {
    const dateObj = this.parseDate(date);
    if (!dateObj) {
      throw new Error('Invalid date provided');
    }

    const locale = options.locale || this.defaultLocale;
    const timeZone = options.timeZone || this.defaultTimeZone;

    if (options.customFormat) {
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        ...options.customFormat,
      }).format(dateObj);
    }

    const formatOptions = this.getFormatOptions(
      options.format || 'medium',
      options.includeTime,
      options.timeFormat
    );

    return new Intl.DateTimeFormat(locale, {
      timeZone,
      ...formatOptions,
    }).format(dateObj);
  }

  private getFormatOptions(
    format: DateFormat,
    includeTime?: boolean,
    timeFormat?: TimeFormat
  ): Intl.DateTimeFormatOptions {
    const baseOptions: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        baseOptions.year = '2-digit';
        baseOptions.month = '2-digit';
        baseOptions.day = '2-digit';
        break;
      case 'medium':
        baseOptions.year = 'numeric';
        baseOptions.month = 'short';
        baseOptions.day = 'numeric';
        break;
      case 'long':
        baseOptions.year = 'numeric';
        baseOptions.month = 'long';
        baseOptions.day = 'numeric';
        baseOptions.weekday = 'long';
        break;
      case 'full':
        baseOptions.year = 'numeric';
        baseOptions.month = 'long';
        baseOptions.day = 'numeric';
        baseOptions.weekday = 'long';
        baseOptions.era = 'long';
        break;
    }

    if (includeTime) {
      baseOptions.hour = '2-digit';
      baseOptions.minute = '2-digit';
      if (timeFormat === '12h') {
        baseOptions.hour12 = true;
      } else {
        baseOptions.hour12 = false;
      }
    }

    return baseOptions;
  }

  private parseDate(date: Date | string | number): Date | null {
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date;
    }

    if (typeof date === 'string' || typeof date === 'number') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }
}

// Funciones de utilidad exportadas

export const formatDate = (date: Date | string | number, locale: string = 'es-ES'): string => {
  const formatter = DateFormatter.getInstance();
  return formatter.format(date, { locale, format: 'long' });
};

export const formatTime = (
  date: Date | string | number,
  locale: string = 'es-ES',
  format: TimeFormat = '24h'
): string => {
  const formatter = DateFormatter.getInstance();
  return formatter.format(date, {
    locale,
    customFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    },
  });
};

export const formatDateTime = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const formatter = DateFormatter.getInstance();
  return formatter.format(date, { ...options, includeTime: true });
};

export const formatRelativeTime = (
  date: Date | string | number,
  locale: string = 'es-ES'
): string => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided');
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, 'second');
  } else if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  } else if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  } else if (Math.abs(diffDay) < 30) {
    return rtf.format(diffDay, 'day');
  } else {
    return formatDate(dateObj, locale);
  }
};

export const parseDate = (date: Date | string | number): Date | null => {
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof date === 'string') {
    // Para strings de fecha como '2023-12-14', crear fecha local en lugar de UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof date === 'number') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export const isValidDate = (date: any): boolean => {
  return parseDate(date) !== null;
};

export const addDays = (date: Date | string | number, days: number): Date => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided');
  }

  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date | string | number, days: number): Date => {
  return addDays(date, -days);
};

export const getDaysDifference = (
  date1: Date | string | number,
  date2: Date | string | number
): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);

  if (!d1 || !d2) {
    throw new Error('Invalid dates provided');
  }

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isToday = (date: Date | string | number): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return false;
  }

  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isTomorrow = (date: Date | string | number): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return false;
  }

  const tomorrow = addDays(new Date(), 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

export const isYesterday = (date: Date | string | number): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return false;
  }

  const yesterday = subtractDays(new Date(), 1);
  return dateObj.toDateString() === yesterday.toDateString();
};

export const isThisWeek = (date: Date | string | number): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return false;
  }

  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

  return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

export const isThisMonth = (date: Date | string | number): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return false;
  }

  const now = new Date();
  return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
};

export const getTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertTimeZone = (
  date: Date | string | number,
  fromTimeZone: string,
  toTimeZone: string
): Date => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    throw new Error('Invalid date provided');
  }

  // Crear formatter para la zona horaria origen
  const fromFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: fromTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Crear formatter para la zona horaria destino
  const toFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: toTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Obtener la diferencia de tiempo
  const fromTime = new Date(fromFormatter.format(dateObj)).getTime();
  const toTime = new Date(toFormatter.format(dateObj)).getTime();
  const offset = toTime - fromTime;

  return new Date(dateObj.getTime() + offset);
};

// Utilidades específicas para la aplicación de coaching

export const formatSessionDate = (date: Date | string | number): string => {
  const dateObj = parseDate(date);
  if (!dateObj) {
    return 'Fecha inválida';
  }

  if (isToday(dateObj)) {
    return `Hoy a las ${formatTime(dateObj)}`;
  } else if (isTomorrow(dateObj)) {
    return `Mañana a las ${formatTime(dateObj)}`;
  } else if (isYesterday(dateObj)) {
    return `Ayer a las ${formatTime(dateObj)}`;
  } else {
    return formatDateTime(dateObj, { format: 'medium', includeTime: true });
  }
};

export const getSessionDuration = (
  startDate: Date | string | number,
  endDate: Date | string | number
): string => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) {
    throw new Error('Invalid dates provided');
  }

  const diffMs = end.getTime() - start.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const isSessionTime = (
  sessionDate: Date | string | number,
  bufferMinutes: number = 15
): boolean => {
  const dateObj = parseDate(sessionDate);
  if (!dateObj) {
    return false;
  }

  const now = new Date();
  const diffMs = Math.abs(dateObj.getTime() - now.getTime());
  const diffMin = diffMs / (1000 * 60);

  return diffMin <= bufferMinutes;
};

export const getAvailableTimeSlots = (
  date: Date,
  duration: number = 60,
  startHour: number = 9,
  endHour: number = 18
): Date[] => {
  const slots: Date[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(startHour, 0, 0, 0);

  while (baseDate.getHours() < endHour) {
    slots.push(new Date(baseDate));
    baseDate.setMinutes(baseDate.getMinutes() + duration);
  }

  return slots;
};
