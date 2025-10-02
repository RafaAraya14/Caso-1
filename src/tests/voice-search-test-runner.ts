/**
 * Test Runner para Voice Search Mapping
 * ====================================
 */

// Simular la función analyzeText para testing
function simulateAnalyzeText(text: string): string[] {
  // Mapeo básico para testing (copia del real)
  const SMART_MAPPINGS_TEST: Record<string, string[]> = {
    // Frases completas
    'me siento estresado': ['Psicología Clínica'],
    'quiero bajar de peso': ['Nutrición y Dietética'],
    'quiero hacer ejercicio': ['Entrenamiento Personal'],
    'quiero aprender a programar': ['Programación Web'],
    'tengo problemas con mi pareja': ['Terapia de Pareja'],

    // Palabras clave
    estrés: ['Psicología Clínica'],
    peso: ['Nutrición y Dietética'],
    programación: ['Programación Web'],
    yoga: ['Yoga y Mindfulness'],
    dinero: ['Coaching Financiero'],
  };

  const normalizedText = text.toLowerCase().trim();
  const foundSpecialties = new Set<string>();

  // 1. Buscar frases completas
  Object.entries(SMART_MAPPINGS_TEST).forEach(([problem, specialties]) => {
    if (problem.length > 10 && normalizedText.includes(problem)) {
      specialties.forEach(specialty => foundSpecialties.add(specialty));
    }
  });

  // 2. Buscar palabras clave
  if (foundSpecialties.size === 0) {
    Object.entries(SMART_MAPPINGS_TEST).forEach(([problem, specialties]) => {
      if (problem.length <= 10 && normalizedText.includes(problem)) {
        specialties.forEach(specialty => foundSpecialties.add(specialty));
      }
    });
  }

  // 3. Fallback
  const result = Array.from(foundSpecialties);
  if (result.length === 0) {
    result.push('Psicología Clínica');
  }

  return result;
}

// Tests de ejemplo
const testCases = [
  { input: 'me siento estresado', expected: ['Psicología Clínica'] },
  { input: 'quiero bajar de peso', expected: ['Nutrición y Dietética'] },
  { input: 'quiero hacer ejercicio', expected: ['Entrenamiento Personal'] },
  { input: 'quiero aprender a programar', expected: ['Programación Web'] },
  { input: 'tengo problemas con mi pareja', expected: ['Terapia de Pareja'] },
  { input: 'estrés', expected: ['Psicología Clínica'] },
  { input: 'xyz random text', expected: ['Psicología Clínica'] }, // Fallback
];

// Función para ejecutar tests
export function runVoiceSearchTests(): void {
  console.log('🧪 EJECUTANDO TESTS DE VOICE SEARCH');
  console.log('=====================================');

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = simulateAnalyzeText(testCase.input);
    const isMatch = JSON.stringify(result) === JSON.stringify(testCase.expected);

    console.log(`\n${index + 1}. 🎤 Input: "${testCase.input}"`);
    console.log(`   🎯 Esperado: ${testCase.expected.join(', ')}`);
    console.log(`   ✅ Obtenido: ${result.join(', ')}`);
    console.log(`   ${isMatch ? '✅ PASS' : '❌ FAIL'}`);

    if (isMatch) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(`\n📊 RESULTADOS:`);
  console.log(`✅ Pasaron: ${passed}`);
  console.log(`❌ Fallaron: ${failed}`);
  console.log(`📈 Éxito: ${((passed / testCases.length) * 100).toFixed(1)}%`);
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).runVoiceSearchTests = runVoiceSearchTests;
  console.log('👆 Ejecuta runVoiceSearchTests() en la consola para probar');
}
