/**
 * String Formatter Utilities
 *
 * Conjunto completo de utilidades para formateo y manipulación de strings.
 * Incluye transformaciones de caso, validaciones, y formateo específico.
 *
 * @pattern Utility Functions + Singleton (StringFormatter)
 */

export interface StringFormatOptions {
  locale?: string;
  maxLength?: number;
  suffix?: string;
  preserveCase?: boolean;
}

/**
 * Singleton StringFormatter para configuración global
 */
export class StringFormatter {
  private static instance: StringFormatter;
  private defaultLocale: string = 'es-ES';

  private constructor() {}

  public static getInstance(): StringFormatter {
    if (!StringFormatter.instance) {
      StringFormatter.instance = new StringFormatter();
    }
    return StringFormatter.instance;
  }

  public configure(locale: string): void {
    this.defaultLocale = locale;
  }

  public getDefaultLocale(): string {
    return this.defaultLocale;
  }
}

// Transformaciones de caso

export const capitalize = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelCase = (str: string): string => {
  return str
    .replace(/[\s\-_]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^./, char => char.toLowerCase());
};

export const pascalCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/[\s\-_]+/g, '');
};

export const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

export const snakeCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

// Formateo y truncado

export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (!str) {
    return str;
  }

  // Si el texto + sufijo es menor o igual al límite, no truncar
  if (str.length + suffix.length <= maxLength) {
    return str;
  }

  let truncateLength = maxLength - suffix.length;
  if (truncateLength <= 0) {
    return suffix.slice(0, maxLength);
  }

  // Si el carácter siguiente es un espacio, retroceder uno
  if (truncateLength < str.length && str[truncateLength] === ' ') {
    truncateLength -= 1;
  }

  return str.slice(0, truncateLength) + suffix;
};
export const removeAccents = (str: string): string => {
  const mapping: { [key: string]: string } = {
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    æ: 'a',
    ç: 'e',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ñ: 'n',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ý: 'y',
    ÿ: 'y',
    À: 'A',
    Á: 'A',
    Â: 'A',
    Ã: 'A',
    Ä: 'A',
    Å: 'A',
    Æ: 'A',
    Ç: 'E',
    È: 'E',
    É: 'E',
    Ê: 'E',
    Ë: 'E',
    Ì: 'I',
    Í: 'I',
    Î: 'I',
    Ï: 'I',
    Ñ: 'N',
    Ò: 'O',
    Ó: 'O',
    Ô: 'O',
    Õ: 'O',
    Ö: 'O',
    Ù: 'U',
    Ú: 'U',
    Û: 'U',
    Ü: 'U',
    Ý: 'Y',
    Ÿ: 'Y',
  };

  return str.replace(
    /[àáâãäåæçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ]/g,
    char => mapping[char] || char
  );
};

export const generateSlug = (str: string): string => {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Máscaras y formateo sensible

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) {
    return email;
  }

  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return email;
  }

  const maskedUsername =
    username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);

  return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) {
    return phone;
  }

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) {
    return phone;
  }

  if (cleaned.length === 10) {
    // (XXX) XXX-XXXX -> (XXX) XXX-**##
    return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2-**$4');
  } else if (cleaned.length === 11) {
    // +1 (XXX) XXX-XXXX -> +1 (XXX) XXX-**##
    return cleaned.replace(/(\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-**$5');
  }

  return phone;
};

// Validaciones

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string, country: string = 'MX'): boolean => {
  const cleaned = phone.replace(/\D/g, '');

  switch (country) {
    case 'MX':
      return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('52'));
    case 'US':
      return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
    default:
      return cleaned.length >= 10 && cleaned.length <= 15;
  }
};

// Utilidades de nombres y texto

export const extractInitials = (name: string, maxInitials: number = 2): string => {
  if (!name) {
    return '';
  }

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials;
};

export const pluralize = (word: string, count: number, locale: string = 'es'): string => {
  if (count === 1) {
    return word;
  }

  if (locale === 'es') {
    // Reglas básicas de pluralización en español
    if (word.endsWith('a') || word.endsWith('e') || word.endsWith('o')) {
      return `${word}s`;
    } else if (word.endsWith('z')) {
      return `${word.slice(0, -1)}ces`;
    } else if (/[aeiou]/.test(word.slice(-1))) {
      return `${word}s`;
    } else {
      return `${word}es`;
    }
  } else {
    // Reglas básicas en inglés
    if (
      word.endsWith('s') ||
      word.endsWith('sh') ||
      word.endsWith('ch') ||
      word.endsWith('x') ||
      word.endsWith('z')
    ) {
      return `${word}es`;
    } else if (word.endsWith('y') && !/[aeiou]/.test(word.slice(-2, -1))) {
      return `${word.slice(0, -1)}ies`;
    } else {
      return `${word}s`;
    }
  }
};

export const singularize = (word: string, locale: string = 'es'): string => {
  if (locale === 'es') {
    if (word.endsWith('ces')) {
      return `${word.slice(0, -3)}z`;
    } else if (word.endsWith('es')) {
      return word.slice(0, -2);
    } else if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
  } else {
    if (word.endsWith('ies')) {
      return `${word.slice(0, -3)}y`;
    } else if (word.endsWith('es')) {
      return word.slice(0, -2);
    } else if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
  }

  return word;
};

// Utilidades de texto rico

export const highlightText = (
  text: string,
  searchTerm: string,
  _className: string = 'highlight'
): string => {
  if (!searchTerm) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, `<mark>$1</mark>`);
};

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const unescapeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Utilidades de comparación

export const similarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

// Utilidades específicas para la aplicación

export const formatCoachName = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) {
    return 'Coach';
  }
  if (!lastName) {
    return capitalize(firstName);
  }
  return `${capitalize(firstName)} ${capitalize(lastName)}`;
};

export const generateUsername = (firstName: string, lastName: string): string => {
  const first = removeAccents(firstName).toLowerCase();
  const last = removeAccents(lastName).toLowerCase();
  return generateSlug(`${first} ${last}`);
};

export const formatSessionTitle = (coachName: string, sessionType: string): string => {
  return `Sesión de ${sessionType} con ${coachName}`;
};

export const parseSearchQuery = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2)
    .map(term => removeAccents(term));
};

export const formatSkills = (skills: string[]): string => {
  if (skills.length === 0) {
    return '';
  }
  if (skills.length === 1) {
    return skills[0];
  }
  if (skills.length === 2) {
    return skills.join(' y ');
  }

  const lastSkill = skills.pop();
  return `${skills.join(', ')} y ${lastSkill}`;
};

export const abbreviate = (text: string, maxWords: number = 10): string => {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(' ')}...`;
};

export const wordCount = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
};

export const readingTime = (text: string, wordsPerMinute: number = 200): number => {
  const words = wordCount(text);
  return Math.ceil(words / wordsPerMinute);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios
};

export const formatPrice = (amount: number, currency: string = 'MXN'): string => {
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  });

  return formatter.format(amount);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const generateSessionCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

export const isValidSessionCode = (code: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(code);
};
