/**
 * Plan de Testing Completo para Voice Search
 * =========================================
 */

// 1. TESTS UNITARIOS PARA MAPEO DE VOZ
export const voiceSearchTests = [
  // Tests de frases completas
  {
    category: 'Frases Completas - Psicología',
    tests: [
      { input: 'me siento estresado', expected: ['Psicología Clínica'] },
      { input: 'estoy muy estresado', expected: ['Psicología Clínica'] },
      { input: 'tengo ansiedad', expected: ['Psicología Clínica'] },
      { input: 'me siento triste', expected: ['Psicología Clínica'] },
    ],
  },
  {
    category: 'Frases Completas - Nutrición',
    tests: [
      { input: 'quiero bajar de peso', expected: ['Nutrición y Dietética'] },
      { input: 'necesito perder peso', expected: ['Nutrición y Dietética'] },
      { input: 'quiero adelgazar', expected: ['Nutrición y Dietética'] },
    ],
  },
  {
    category: 'Frases Completas - Ejercicio',
    tests: [
      { input: 'quiero hacer ejercicio', expected: ['Entrenamiento Personal'] },
      { input: 'quiero estar en forma', expected: ['Entrenamiento Personal'] },
      { input: 'necesito un entrenador', expected: ['Entrenamiento Personal'] },
    ],
  },
  {
    category: 'Frases Completas - Programación',
    tests: [
      { input: 'quiero aprender a programar', expected: ['Programación Web'] },
      { input: 'problemas con código', expected: ['Programación Web'] },
      { input: 'quiero hacer una página web', expected: ['Programación Web'] },
    ],
  },
  {
    category: 'Frases Completas - Terapia de Pareja',
    tests: [
      { input: 'tengo problemas con mi pareja', expected: ['Terapia de Pareja'] },
      { input: 'mi relación no va bien', expected: ['Terapia de Pareja'] },
      { input: 'peleamos mucho', expected: ['Terapia de Pareja'] },
    ],
  },
  {
    category: 'Palabras Clave Individuales',
    tests: [
      { input: 'estrés', expected: ['Psicología Clínica'] },
      { input: 'peso', expected: ['Nutrición y Dietética'] },
      { input: 'programación', expected: ['Programación Web'] },
      { input: 'yoga', expected: ['Yoga y Mindfulness'] },
      { input: 'dinero', expected: ['Coaching Financiero'] },
    ],
  },
  {
    category: 'Análisis Semántico',
    tests: [
      { input: 'tengo un problema grave', expected: ['Psicología Clínica'] },
      { input: 'necesito ayuda con una aplicación', expected: ['Programación Web'] },
      { input: 'quiero ser creativo', expected: ['Pintura y Arte'] },
      { input: 'mi máquina no funciona', expected: ['Mecánica Automotriz'] },
    ],
  },
  {
    category: 'Casos Edge y Fallback',
    tests: [
      { input: 'xyz abc 123', expected: ['Psicología Clínica'] }, // Fallback
      { input: '', expected: ['Psicología Clínica'] }, // Vacío
      { input: 'hola mundo', expected: ['Psicología Clínica'] }, // Sin match
    ],
  },
];

// 2. TESTS DE INTEGRACIÓN UI
export const uiIntegrationTests = [
  {
    name: 'Voice Search Button',
    steps: [
      'Verificar que el botón de micrófono está visible',
      'Hacer clic en el botón',
      'Verificar que pide permisos de micrófono',
      'Verificar que cambia a estado "escuchando"',
    ],
  },
  {
    name: 'Category Filter Integration',
    steps: [
      'Usar búsqueda por voz con frase "quiero bajar de peso"',
      'Verificar que se selecciona categoría "Nutrición y Dietética"',
      'Verificar que se filtran solo coaches de esa categoría',
      'Verificar que el dropdown muestra la categoría seleccionada',
    ],
  },
  {
    name: 'Manual Search Within Category',
    steps: [
      'Seleccionar categoría "Psicología Clínica"',
      'Escribir "María" en el campo de búsqueda',
      'Presionar botón "Buscar"',
      'Verificar que muestra solo María García',
    ],
  },
];

// 3. TESTS DE PERFORMANCE Y ERRORES
export const errorHandlingTests = [
  {
    name: 'Microphone Permission Denied',
    scenario: 'Usuario niega permisos de micrófono',
    expected: 'Mostrar mensaje de error apropiado',
  },
  {
    name: 'No Speech Detected',
    scenario: 'No se detecta voz durante 5 segundos',
    expected: 'Mostrar mensaje "No se detectó ningún sonido"',
  },
  {
    name: 'Network Error',
    scenario: 'Error de conexión durante reconocimiento',
    expected: 'Mostrar mensaje de error de red',
  },
  {
    name: 'Browser Compatibility',
    scenario: 'Navegador no soporta Web Speech API',
    expected: 'Deshabilitar botón y mostrar mensaje informativo',
  },
];

// 4. CHECKLIST PRE-PUSH
export const prePushChecklist = [
  '✅ Todos los tests unitarios pasan',
  '✅ No hay errores de TypeScript',
  '✅ No hay errores de linting',
  '✅ La aplicación carga sin errores en consola',
  '✅ Voice search funciona con frases de ejemplo',
  '✅ Filtrado por categoría funciona correctamente',
  '✅ Búsqueda manual dentro de categorías funciona',
  '✅ Manejo de errores funciona apropiadamente',
  '✅ Performance es aceptable (< 2s respuesta)',
  '✅ Documentación está actualizada',
];
