// src/utils/dateFormatter.ts

export const formatDate = (date: Date, locale: string = 'es-ES'): string => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

export const formatTime = (date: Date, locale: string = 'es-ES'): string => {
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};