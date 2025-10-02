# Guía de Linting para 20minCoach

## Descripción General

Este proyecto utiliza ESLint con configuración profesional personalizada para mantener la calidad del código. La configuración incluye:

- **TypeScript**: Reglas específicas para TypeScript
- **React**: Mejores prácticas para React y JSX
- **Accesibilidad**: Reglas de JSX-a11y para accesibilidad web
- **Importaciones**: Organización y validación de imports
- **Prettier**: Formato de código consistente
- **Git Hooks**: Validación automática en commits

## Configuración

### Archivos de Configuración

- `.eslintrc.js` - Configuración principal de ESLint
- `.prettierrc.json` - Configuración de formato de código
- `.prettierignore` - Archivos excluidos del formato
- `.eslintignore` - Archivos excluidos del linting
- `.editorconfig` - Configuración del editor
- `.vscode/settings.json` - Configuración específica de VSCode

### Scripts Disponibles

```bash
# Ejecutar linting
npm run lint

# Aplicar correcciones automáticas
npm run lint:fix

# Formatear código con Prettier
npm run format

# Verificar tipos TypeScript
npm run type-check

# Pre-commit (automático)
npm run pre-commit
```

## Reglas Principales

### TypeScript (`@typescript-eslint`)

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `no-unused-vars` | error | Variables no utilizadas deben usar prefijo `_` |
| `no-explicit-any` | warn | Evitar uso de `any`, usar tipos específicos |
| `no-non-null-assertion` | warn | Evitar operador `!` de no-null |
| `prefer-nullish-coalescing` | error | Usar `??` en lugar de `\|\|` |
| `prefer-optional-chain` | error | Usar encadenamiento opcional `?.` |

### React (`react`)

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `jsx-pascal-case` | error | Componentes en PascalCase |
| `no-array-index-key` | warn | Evitar índices como keys |
| `no-unstable-nested-components` | error | No definir componentes dentro de otros |
| `jsx-key` | error | Props `key` requeridas en listas |

### Accesibilidad (`jsx-a11y`)

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `label-has-associated-control` | error | Labels deben estar asociados con controles |
| `click-events-have-key-events` | error | Eventos click necesitan eventos de teclado |
| `no-static-element-interactions` | error | Elementos estáticos no interactivos |

### Importaciones (`import`)

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `order` | error | Orden específico de imports |
| `no-cycle` | error | Detectar dependencias circulares |
| `no-self-import` | error | No importar el mismo archivo |
| `first` | error | Imports al inicio del archivo |

### Calidad de Código

| Regla | Nivel | Descripción |
|-------|-------|-------------|
| `max-lines-per-function` | warn | Máximo 50 líneas por función |
| `max-lines` | warn | Máximo 300 líneas por archivo |
| `complexity` | warn | Complejidad ciclomática máx. 10 |
| `max-params` | warn | Máximo 4 parámetros por función |
| `no-console` | warn | Evitar console.log en producción |

## Configuración de Git Hooks

### Pre-commit Hook

El hook de pre-commit ejecuta automáticamente:

1. **Lint-staged**: Solo archivos modificados
2. **ESLint**: Correcciones automáticas
3. **Prettier**: Formato de código
4. **Type-check**: Verificación de tipos

### Configuración en `package.json`

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## Guías de Contribución

### 1. Configuración del Entorno

```bash
# Instalar dependencias
npm install

# Configurar hooks de git
npm run prepare
```

### 2. Desarrollo

```bash
# Antes de commit
npm run lint:fix
npm run format
npm run type-check

# O automáticamente con el hook
git commit -m "feat: nueva funcionalidad"
```

### 3. Resolución de Errores

#### Variables No Utilizadas
```typescript
// ❌ Error
function example(unusedParam: string) {
  return 'hello';
}

// ✅ Correcto
function example(_unusedParam: string) {
  return 'hello';
}
```

#### Accesibilidad JSX
```tsx
// ❌ Error
<label>Email</label>
<input type="email" />

// ✅ Correcto
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

#### Importaciones
```typescript
// ❌ Error - orden incorrecto
import { Component } from './Component';
import React from 'react';

// ✅ Correcto - orden: builtin, external, internal
import React from 'react';

import { Component } from './Component';
```

### 4. Excepciones

Para deshabilitar reglas específicas:

```typescript
// Para una línea
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;

// Para un bloque
/* eslint-disable no-console */
console.log('Debug info');
console.error('Error details');
/* eslint-enable no-console */

// Para todo el archivo
/* eslint-disable @typescript-eslint/no-explicit-any */
```

## Configuración de VSCode

### Extensiones Recomendadas

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Hero (`rbbit.typescript-hero`)

### Configuración Automática

El archivo `.vscode/settings.json` configura automáticamente:

- Formato al guardar
- ESLint como formateador
- Organizador de imports
- Configuración TypeScript

## Métricas de Calidad

### Estado Actual
- **Problemas totales**: 227 (reducido de 11,534)
- **Errores**: 38
- **Warnings**: 189
- **Archivos analizados**: 80+

### Objetivos
- **Errores**: 0
- **Warnings críticos**: 0
- **Deuda técnica**: < 1 hora

## Resolución de Problemas

### Error: "Resolver not found"
```bash
npm install --save-dev eslint-import-resolver-typescript
```

### Error: "Parser options"
Verificar `tsconfig.json` existe y es válido.

### Error: "Plugin not found"
```bash
npm install --save-dev @typescript-eslint/eslint-plugin
```

### Performance Lenta
Agregar archivos grandes a `.eslintignore`:
```
node_modules/
dist/
build/
coverage/
```

## Scripts de Mantenimiento

```bash
# Actualizar dependencias de linting
npm update eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Verificar configuración
npx eslint --print-config src/index.tsx

# Validar reglas
npx eslint --validate-config .eslintrc.js
```

## Recursos Adicionales

- [ESLint Docs](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [JSX-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [Prettier](https://prettier.io/docs/en/)