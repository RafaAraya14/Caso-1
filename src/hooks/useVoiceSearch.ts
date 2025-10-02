import { useCallback, useRef, useState } from 'react';

// Interfaces para TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Mapeo inteligente que usa las especialidades REALES de los coaches
const SMART_MAPPINGS: Record<string, string[]> = {
  // PSICOLOGÍA CLÍNICA - Problemas emocionales/mentales
  'me siento estresado': ['Psicología Clínica'],
  'estoy muy estresado': ['Psicología Clínica'],
  'tengo mucho estrés': ['Psicología Clínica'],
  'me siento ansioso': ['Psicología Clínica'],
  'tengo ansiedad': ['Psicología Clínica'],
  'me da mucha ansiedad': ['Psicología Clínica'],
  'estoy deprimido': ['Psicología Clínica'],
  'me siento triste': ['Psicología Clínica'],
  'no tengo confianza': ['Psicología Clínica'],
  'me falta autoestima': ['Psicología Clínica'],
  'me siento inseguro': ['Psicología Clínica'],
  'no puedo dormir': ['Psicología Clínica'],
  'tengo problemas para dormir': ['Psicología Clínica'],
  'me cuesta dormir': ['Psicología Clínica'],
  'no tengo energía': ['Psicología Clínica'],
  'me siento cansado': ['Psicología Clínica'],

  // TERAPIA DE PAREJA - Problemas de relación
  'tengo problemas con mi pareja': ['Terapia de Pareja'],
  'mi relación no va bien': ['Terapia de Pareja'],
  'no me llevo bien con mi pareja': ['Terapia de Pareja'],
  'peleamos mucho': ['Terapia de Pareja'],
  'no sabemos comunicarnos': ['Terapia de Pareja'],
  'problemas de pareja': ['Terapia de Pareja'],
  'crisis matrimonial': ['Terapia de Pareja'],

  // NUTRICIÓN Y DIETÉTICA - Alimentación y peso
  'quiero bajar de peso': ['Nutrición y Dietética'],
  'necesito perder peso': ['Nutrición y Dietética'],
  'quiero adelgazar': ['Nutrición y Dietética'],
  'no puedo bajar de peso': ['Nutrición y Dietética'],
  'como muy mal': ['Nutrición y Dietética'],
  'problemas de alimentación': ['Nutrición y Dietética'],
  'quiero hacer dieta': ['Nutrición y Dietética'],
  'necesito comer mejor': ['Nutrición y Dietética'],

  // ENTRENAMIENTO PERSONAL - Fitness y ejercicio
  'quiero estar en forma': ['Entrenamiento Personal'],
  'quiero hacer ejercicio': ['Entrenamiento Personal'],
  'no tengo motivación para ejercitarme': ['Entrenamiento Personal'],
  'odio el gimnasio': ['Entrenamiento Personal'],
  'quiero ganar músculo': ['Entrenamiento Personal'],
  'necesito un entrenador': ['Entrenamiento Personal'],
  'quiero ponerme en forma': ['Entrenamiento Personal'],

  // COACHING PROFESIONAL - Carrera y trabajo
  'odio mi trabajo': ['Coaching Profesional'],
  'quiero cambiar de trabajo': ['Coaching Profesional'],
  'no me gusta mi trabajo': ['Coaching Profesional'],
  'problemas laborales': ['Coaching Profesional'],
  'necesito orientación profesional': ['Coaching Profesional'],
  'quiero ascender': ['Coaching Profesional'],
  'desarrollo profesional': ['Coaching Profesional'],

  // YOGA Y MINDFULNESS - Relajación y bienestar
  'necesito relajarme': ['Yoga y Mindfulness'],
  'quiero meditar': ['Yoga y Mindfulness'],
  'necesito paz mental': ['Yoga y Mindfulness'],
  'quiero hacer yoga': ['Yoga y Mindfulness'],
  'necesito calma': ['Yoga y Mindfulness'],

  // COACHING FINANCIERO - Dinero y finanzas
  'tengo problemas de dinero': ['Coaching Financiero'],
  'no sé ahorrar': ['Coaching Financiero'],
  'quiero organizar mis finanzas': ['Coaching Financiero'],
  'problemas financieros': ['Coaching Financiero'],
  'necesito invertir': ['Coaching Financiero'],
  'quiero ser rico': ['Coaching Financiero'],

  // INGLÉS CONVERSACIONAL - Idiomas
  'quiero aprender inglés': ['Inglés Conversacional'],
  'necesito mejorar mi inglés': ['Inglés Conversacional'],
  'inglés para el trabajo': ['Inglés Conversacional'],
  'practicar inglés': ['Inglés Conversacional'],
  'speaking en inglés': ['Inglés Conversacional'],

  // PROGRAMACIÓN WEB - Tecnología
  'quiero aprender a programar': ['Programación Web'],
  'problemas con código': ['Programación Web'],
  'necesito ayuda con programación': ['Programación Web'],
  'quiero hacer una página web': ['Programación Web'],
  'no entiendo javascript': ['Programación Web'],

  // MARKETING DIGITAL - Negocio online
  'quiero vender online': ['Marketing Digital'],
  'necesito más clientes': ['Marketing Digital'],
  'publicidad en redes': ['Marketing Digital'],
  'marketing en internet': ['Marketing Digital'],
  'redes sociales para negocio': ['Marketing Digital'],

  // MÚSICA Y PIANO - Arte musical
  'quiero aprender piano': ['Música y Piano'],
  'tocar un instrumento': ['Música y Piano'],
  'clases de música': ['Música y Piano'],
  'aprender a tocar': ['Música y Piano'],

  // FOTOGRAFÍA PROFESIONAL - Arte visual
  'quiero aprender fotografía': ['Fotografía Profesional'],
  'tomar mejores fotos': ['Fotografía Profesional'],
  'fotografía profesional': ['Fotografía Profesional'],
  'curso de fotografía': ['Fotografía Profesional'],

  // REPOSTERÍA Y PANADERÍA - Cocina
  'quiero aprender a hornear': ['Repostería y Panadería'],
  'hacer pasteles': ['Repostería y Panadería'],
  'clases de repostería': ['Repostería y Panadería'],
  'aprender a cocinar': ['Repostería y Panadería'],

  // DISEÑO GRÁFICO - Creatividad digital
  'diseño gráfico': ['Diseño Gráfico'],
  'aprender photoshop': ['Diseño Gráfico'],
  'crear logos': ['Diseño Gráfico'],
  'diseño web': ['Diseño Gráfico'],

  // EMPRENDIMIENTO Y STARTUPS - Negocios
  'quiero emprender': ['Emprendimiento y Startups'],
  'crear mi empresa': ['Emprendimiento y Startups'],
  'idea de negocio': ['Emprendimiento y Startups'],
  startup: ['Emprendimiento y Startups'],

  // ORGANIZACIÓN Y PRODUCTIVIDAD - Eficiencia personal
  'soy muy desorganizado': ['Organización y Productividad'],
  'procrastino mucho': ['Organización y Productividad'],
  'no sé organizar mi tiempo': ['Organización y Productividad'],
  'necesito ser más productivo': ['Organización y Productividad'],

  // MECÁNICA AUTOMOTRIZ - Vehículos
  'mi carro no funciona': ['Mecánica Automotriz'],
  'problemas con el carro': ['Mecánica Automotriz'],
  'ruido en el motor': ['Mecánica Automotriz'],

  // PINTURA Y ARTE - Arte tradicional
  'quiero aprender a pintar': ['Pintura y Arte'],
  'clases de arte': ['Pintura y Arte'],
  'pintar cuadros': ['Pintura y Arte'],

  // CARPINTERÍA Y EBANISTERÍA - Trabajo manual
  'trabajar la madera': ['Carpintería y Ebanistería'],
  'hacer muebles': ['Carpintería y Ebanistería'],
  carpintería: ['Carpintería y Ebanistería'],

  // COSTURA Y CONFECCIÓN - Textiles
  'aprender a coser': ['Costura y Confección'],
  'hacer ropa': ['Costura y Confección'],
  costura: ['Costura y Confección'],

  // JARDINERÍA Y PAISAJISMO - Naturaleza
  'cuidar plantas': ['Jardinería y Paisajismo'],
  'hacer un jardín': ['Jardinería y Paisajismo'],
  jardinería: ['Jardinería y Paisajismo'],

  // DANZA Y COREOGRAFÍA - Movimiento
  'aprender a bailar': ['Danza y Coreografía'],
  'clases de baile': ['Danza y Coreografía'],
  'bailar mejor': ['Danza y Coreografía'],

  // ELECTRICIDAD DOMÉSTICA - Reparaciones
  'problemas eléctricos': ['Electricidad Doméstica'],
  'instalación eléctrica': ['Electricidad Doméstica'],

  // Palabras clave individuales para fallback
  estrés: ['Psicología Clínica', 'Yoga y Mindfulness'],
  ansiedad: ['Psicología Clínica'],
  depresión: ['Psicología Clínica'],
  autoestima: ['Psicología Clínica'],
  confianza: ['Psicología Clínica'],
  relaciones: ['Terapia de Pareja', 'Psicología Clínica'],
  pareja: ['Terapia de Pareja'],
  comunicación: ['Terapia de Pareja', 'Psicología Clínica'],
  trabajo: ['Coaching Profesional'],
  carrera: ['Coaching Profesional'],
  peso: ['Nutrición y Dietética'],
  dieta: ['Nutrición y Dietética'],
  ejercicio: ['Entrenamiento Personal'],
  gimnasio: ['Entrenamiento Personal'],
  motivación: ['Psicología Clínica', 'Coaching Profesional'],
  hábitos: ['Psicología Clínica', 'Organización y Productividad'],
  tiempo: ['Organización y Productividad'],
  organización: ['Organización y Productividad'],
  productividad: ['Organización y Productividad'],
  dinero: ['Coaching Financiero'],
  finanzas: ['Coaching Financiero'],
  inglés: ['Inglés Conversacional'],
  programación: ['Programación Web'],
  código: ['Programación Web'],
  web: ['Programación Web'],
  marketing: ['Marketing Digital'],
  negocio: ['Emprendimiento y Startups', 'Marketing Digital'],
  emprender: ['Emprendimiento y Startups'],
  música: ['Música y Piano'],
  piano: ['Música y Piano'],
  fotografía: ['Fotografía Profesional'],
  fotos: ['Fotografía Profesional'],
  cocinar: ['Repostería y Panadería'],
  hornear: ['Repostería y Panadería'],
  diseño: ['Diseño Gráfico'],
  arte: ['Pintura y Arte', 'Diseño Gráfico'],
  pintura: ['Pintura y Arte'],
  carro: ['Mecánica Automotriz'],
  auto: ['Mecánica Automotriz'],
  motor: ['Mecánica Automotriz'],
  madera: ['Carpintería y Ebanistería'],
  coser: ['Costura y Confección'],
  jardín: ['Jardinería y Paisajismo'],
  plantas: ['Jardinería y Paisajismo'],
  bailar: ['Danza y Coreografía'],
  yoga: ['Yoga y Mindfulness'],
  meditación: ['Yoga y Mindfulness'],
};

interface UseVoiceSearchProps {
  onSearchResult: (query: string, specialties: string[]) => void;
  language?: string;
}

interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  confidence: number;
}

export const useVoiceSearch = ({ onSearchResult, language = 'es-ES' }: UseVoiceSearchProps) => {
  const [state, setState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    transcript: '',
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Función mejorada para analizar texto con mapeo a especialidades reales
  const analyzeText = useCallback((text: string): string[] => {
    const normalizedText = text.toLowerCase().trim();
    const foundSpecialties = new Set<string>();

    console.log('🎤 Analizando:', normalizedText);

    // 1. Buscar coincidencias exactas de frases completas (prioridad alta)
    Object.entries(SMART_MAPPINGS).forEach(([problem, specialties]) => {
      if (problem.length > 10 && normalizedText.includes(problem)) {
        specialties.forEach(specialty => foundSpecialties.add(specialty));
        console.log(`✅ Frase completa encontrada: "${problem}" → ${specialties.join(', ')}`);
      }
    });

    // 2. Si no encontró frases completas, buscar palabras clave individuales
    if (foundSpecialties.size === 0) {
      Object.entries(SMART_MAPPINGS).forEach(([problem, specialties]) => {
        if (problem.length <= 10 && normalizedText.includes(problem)) {
          specialties.forEach(specialty => foundSpecialties.add(specialty));
          console.log(`🔍 Palabra clave encontrada: "${problem}" → ${specialties.join(', ')}`);
        }
      });
    }

    // 3. Análisis semántico adicional para palabras no mapeadas
    if (foundSpecialties.size === 0) {
      console.log('🧠 Aplicando análisis semántico...');

      console.log('[VOICE] Realizando análisis semántico de:', normalizedText);

      // Buscar palabras relacionadas con emociones → Psicología
      if (
        normalizedText.match(
          /\b(mal|bien|horrible|terrible|difícil|problema|ayuda|siento|estoy|tengo)\b/
        )
      ) {
        foundSpecialties.add('Psicología Clínica');
        console.log('😔 Contexto emocional/psicológico detectado → Psicología Clínica');
      }

      // Buscar palabras relacionadas con tecnología → Programación
      if (
        normalizedText.match(
          /\b(tecnología|computadora|ordenador|sistema|software|app|aplicación)\b/
        )
      ) {
        foundSpecialties.add('Programación Web');
        console.log('💻 Contexto tecnológico detectado → Programación Web');
      }

      // Buscar palabras relacionadas con creatividad → Arte
      if (normalizedText.match(/\b(crear|creativo|expresar|diseño|visual|estético)\b/)) {
        foundSpecialties.add('Pintura y Arte');
        console.log('🎨 Contexto creativo detectado → Pintura y Arte');
      }

      // Buscar palabras relacionadas con vehículos → Mecánica
      if (normalizedText.match(/\b(máquina|reparar|arreglar|funcionar|ruido|falla)\b/)) {
        foundSpecialties.add('Mecánica Automotriz');
        console.log('🔧 Contexto mecánico detectado → Mecánica Automotriz');
      }
    }

    const result = Array.from(foundSpecialties);
    console.log('🎯 Especialidades finales encontradas:', result);

    // Si no encontró nada específico, sugerir psicología como fallback
    if (result.length === 0) {
      console.log(
        '🤔 No se encontraron patrones específicos, sugiriendo Psicología Clínica como fallback'
      );
      result.push('Psicología Clínica');
    }

    return result;
  }, []);

  const startListening = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'El reconocimiento de voz no está soportado en este navegador',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));

      // Solicitar permisos de micrófono explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      // Iniciar reconocimiento de voz
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass() as SpeechRecognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null, transcript: '' }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const { transcript } = result[0];
        const { confidence } = result[0];

        setState(prev => ({
          ...prev,
          transcript,
          confidence: confidence || 0,
        }));

        if (result.isFinal) {
          const specialties = analyzeText(transcript);
          console.log('🎙️ Transcripción final:', transcript);
          console.log('🎯 Especialidades detectadas:', specialties);
          onSearchResult(transcript, specialties);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Error en el reconocimiento de voz';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó ningún sonido. Intenta hablar más alto.';
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono.';
            break;
          case 'not-allowed':
            errorMessage =
              'Permisos de micrófono denegados. Permite el acceso y recarga la página.';
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      let errorMessage = 'Error al inicializar el reconocimiento de voz';

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage =
              'Permisos de micrófono denegados. Permite el acceso y recarga la página.';
            break;
          case 'NotFoundError':
            errorMessage = 'No se encontró ningún micrófono.';
            break;
          case 'NotSupportedError':
            errorMessage = 'El navegador no soporta acceso al micrófono.';
            break;
          case 'SecurityError':
            errorMessage = 'Error de seguridad. Asegúrate de usar HTTPS.';
            break;
          default:
            errorMessage = `Error de micrófono: ${error.message}`;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));
    }
  }, [state.isSupported, language, analyzeText, onSearchResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    clearError,
    analyzeText,
  };
};
