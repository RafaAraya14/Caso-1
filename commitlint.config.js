module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bugs
        'docs',     // Documentación
        'style',    // Cambios de formato
        'refactor', // Refactoring de código
        'test',     // Añadir o corregir tests
        'chore',    // Cambios en el build o herramientas
        'perf',     // Mejoras de performance
        'ci',       // Cambios en CI/CD
        'revert'    // Revertir commits
      ]
    ],
    'subject-case': [0], // Permitir cualquier caso en el subject
    'header-max-length': [2, 'always', 100]
  }
};