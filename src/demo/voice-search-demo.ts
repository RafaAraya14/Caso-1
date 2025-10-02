/**
 * Demo de búsqueda de voz inteligente - muestra cómo el sistema mapea 
 * problemas expresados naturalmente a especialidades de coaches
 */

// Ejemplos de frases que el usuario puede decir y qué especialidades deberían sugerir
export const voiceSearchExamples = [
  {
    userSays: "me siento muy estresado",
    expectedSpecialties: ["psicología", "mindfulness", "gestión del estrés"],
    category: "Emocional"
  },
  {
    userSays: "quiero bajar de peso",
    expectedSpecialties: ["nutrición", "fitness", "coaching personal"],
    category: "Fitness"
  },
  {
    userSays: "tengo problemas con mi pareja",
    expectedSpecialties: ["terapia de pareja", "comunicación", "psicología"],
    category: "Relaciones"
  },
  {
    userSays: "odio mi trabajo",
    expectedSpecialties: ["coaching profesional", "psicología laboral"],
    category: "Trabajo"
  },
  {
    userSays: "no puedo dormir",
    expectedSpecialties: ["wellness", "psicología", "higiene del sueño"],
    category: "Salud"
  },
  {
    userSays: "me da pánico hablar en público",
    expectedSpecialties: ["comunicación", "psicología", "ansiedad social"],
    category: "Comunicación"
  },
  {
    userSays: "no tengo motivación",
    expectedSpecialties: ["coaching personal", "psicología", "desarrollo personal"],
    category: "Desarrollo Personal"
  },
  {
    userSays: "procrastino mucho",
    expectedSpecialties: ["coaching personal", "psicología", "gestión del tiempo"],
    category: "Productividad"
  }
];

/**
 * Función de prueba para demostrar cómo funciona el análisis inteligente
 */
export function testVoiceSearchIntelligence() {
  console.log('🎤 DEMO DE BÚSQUEDA DE VOZ INTELIGENTE');
  console.log('=====================================\n');
  
  voiceSearchExamples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.category.toUpperCase()}`);
    console.log(`   Usuario dice: "${example.userSays}"`);
    console.log(`   Especialidades esperadas: ${example.expectedSpecialties.join(', ')}`);
    console.log('   ---');
  });
  
  console.log('\n🚀 Para probar, usa el micrófono en la aplicación y di cualquiera de estas frases.');
  console.log('El sistema debería mapear automáticamente tu problema a las especialidades correctas.\n');
}

/**
 * Métricas de efectividad de la búsqueda inteligente
 */
export const intelligenceMetrics = {
  totalMappings: 80, // Número total de mapeos en SMART_MAPPINGS
  contextualPhrases: 45, // Frases completas con contexto
  keywordFallbacks: 35, // Palabras clave individuales
  emotionalPatterns: 25, // Patrones emocionales detectados
  semanticAnalysis: true, // Análisis semántico activado
  fallbackStrategy: 'coaching general' // Estrategia cuando no encuentra patrones
};

// Instrucciones para el usuario
export const userInstructions = `
🎤 CÓMO USAR LA BÚSQUEDA DE VOZ INTELIGENTE:

1. Haz clic en el botón del micrófono 🎙️
2. Permite el acceso al micrófono cuando el navegador lo solicite
3. Habla naturalmente sobre tu problema, por ejemplo:
   - "Me siento muy estresado últimamente"
   - "Quiero perder peso antes del verano"  
   - "Tengo problemas de comunicación en el trabajo"
   - "No puedo dormir bien por las noches"

4. El sistema analizará tu descripción y te sugerirá coaches especializados
5. Si no encuentra patrones específicos, te sugerirá coaching general

💡 CONSEJOS:
- Habla claramente y a ritmo normal
- Usa frases completas para mejor análisis
- El sistema entiende español naturally
- Puedes describir emociones y contextos
`;