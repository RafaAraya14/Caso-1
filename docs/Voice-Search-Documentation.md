# Búsqueda por Voz Inteligente - Documentación

## 🎤 Funcionalidades Implementadas

### 1. **Reconocimiento de Voz**

- Utiliza Web Speech API nativo del navegador
- Soporte para español (es-ES)
- Detección automática de finalización de habla
- Indicadores visuales de estado (grabando, procesando, error)

### 2. **Búsqueda Inteligente**

- Mapeo semántico de problemas a especialidades de coaches
- Análisis de contexto para sugerir especialidades relevantes
- Búsqueda por palabras clave relacionadas

### 3. **Mapeo de Problemas a Especialidades**

#### 🧠 Psicología y Salud Mental

- **"estrés"** → psicología, mindfulness, bienestar
- **"ansiedad"** → psicología, terapia cognitiva, mindfulness
- **"depresión"** → psicología, terapia, bienestar
- **"relaciones"** → psicología, terapia de pareja, comunicación
- **"autoestima"** → psicología, desarrollo personal

#### 💪 Salud Física y Nutrición

- **"bajar de peso"** → nutrición, fitness, wellness
- **"alimentación"** → nutrición, dietética
- **"ejercicio"** → fitness, entrenamiento personal
- **"yoga"** → yoga, mindfulness, bienestar

#### 🚀 Desarrollo Personal

- **"confianza"** → desarrollo personal, autoestima, liderazgo
- **"motivación"** → coaching personal, desarrollo personal
- **"metas"** → coaching personal, productividad
- **"hábitos"** → coaching personal, desarrollo personal

#### 💼 Habilidades Profesionales

- **"trabajo"** → coaching ejecutivo, liderazgo, productividad
- **"comunicación"** → comunicación, liderazgo, habilidades sociales
- **"liderazgo"** → liderazgo, coaching ejecutivo
- **"ventas"** → coaching de ventas, comunicación

## 🔧 Uso Técnico

### Hook `useVoiceSearch`

```typescript
import { useVoiceSearch } from '../../hooks/useVoiceSearch';

const {
  isListening, // boolean - Si está grabando
  isSupported, // boolean - Si el navegador soporta speech recognition
  transcript, // string - Texto transcrito
  error, // string | null - Error actual
  confidence, // number - Confianza de la transcripción (0-1)
  startListening, // función - Iniciar grabación
  stopListening, // función - Detener grabación
  clearError, // función - Limpiar errores
  analyzeText, // función - Analizar texto manualmente
} = useVoiceSearch({
  onSearchResult: (query: string, specialties: string[]) => {
    // Callback cuando se completa la transcripción
    console.log('Búsqueda:', query);
    console.log('Especialidades sugeridas:', specialties);
  },
  language: 'es-ES', // Idioma de reconocimiento
});
```

### Integración en Componentes

```typescript
// En el componente de búsqueda
const onSearchResult = (query: string, specialties: string[]) => {
  // Usar transcripción como texto de búsqueda
  setSearchText(query);

  // Si hay especialidades, aplicar la primera
  if (specialties.length > 0) {
    setSelectedSpecialty(specialties[0]);
  }
};
```

## 🎯 Ejemplos de Uso

### Consultas de Ejemplo y Resultados Esperados

| Frase del Usuario                        | Especialidades Sugeridas                               |
| ---------------------------------------- | ------------------------------------------------------ |
| "Tengo mucho estrés en el trabajo"       | psicología, mindfulness, bienestar, coaching ejecutivo |
| "Quiero bajar de peso y hacer ejercicio" | nutrición, fitness, wellness                           |
| "Necesito ayuda con mi ansiedad"         | psicología, terapia cognitiva, mindfulness             |
| "Quiero mejorar mi comunicación"         | comunicación, liderazgo, habilidades sociales          |
| "Tengo problemas para dormir"            | wellness, hábitos saludables                           |
| "Necesito motivación para mis metas"     | coaching personal, desarrollo personal                 |

### Manejo de Estados

#### 🎤 Estado de Grabación

```jsx
{
  isListening && (
    <div className="recording-indicator">
      <i className="fas fa-microphone animate-pulse" />
      Escuchando... Habla ahora
    </div>
  );
}
```

#### 📝 Mostrar Transcripción

```jsx
{
  transcript && (
    <div className="transcript-display">
      <span>Transcripción:</span>
      <p>"{transcript}"</p>
      {confidence > 0 && (
        <span>Confianza: {Math.round(confidence * 100)}%</span>
      )}
    </div>
  );
}
```

#### ⚠️ Manejo de Errores

```jsx
{
  error && (
    <div className="error-display">
      <i className="fas fa-exclamation-triangle" />
      {error}
      <button onClick={clearError}>Cerrar</button>
    </div>
  );
}
```

## 🌐 Compatibilidad del Navegador

### ✅ Soportados

- **Chrome/Chromium** - Excelente soporte
- **Edge** - Buen soporte
- **Safari** - Soporte limitado (solo macOS/iOS recientes)

### ❌ No Soportados

- **Firefox** - Sin soporte nativo
- **Navegadores antiguos** - Sin soporte

### Detección de Soporte

```typescript
const isSupported =
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
```

## 🚀 Funcionalidades Futuras

### Próximas Mejoras

1. **Múltiples idiomas** - Soporte para inglés, francés, etc.
2. **Comandos de voz** - "Buscar coaches de psicología", "Mostrar disponibles"
3. **Filtros por voz** - "Solo coaches con 5 estrellas"
4. **Integración con IA** - Análisis más sofisticado de intenciones
5. **Offline support** - Usar modelos locales como Whisper

### Configuraciones Avanzadas

1. **Sensibilidad de detección** - Ajustar cuándo parar de grabar
2. **Filtros de ruido** - Mejorar calidad en ambientes ruidosos
3. **Vocabulario personalizado** - Añadir términos específicos del coaching

## 🎨 Personalización de UI

### Estilos del Botón de Micrófono

```css
/* Botón normal */
.microphone-button {
  @apply text-slate-500 hover:text-indigo-600 transition-colors;
}

/* Estado grabando */
.microphone-button.recording {
  @apply text-red-500 animate-pulse;
}

/* No soportado */
.microphone-button.disabled {
  @apply text-slate-400 cursor-not-allowed;
}
```

### Animaciones

- **Pulso rojo** durante grabación
- **Fade in/out** para mensajes de estado
- **Shake** para errores
- **Checkmark** para confirmación

## 📱 Mejores Prácticas

### UX Recommendations

1. **Feedback inmediato** - Mostrar estado de grabación claramente
2. **Instrucciones claras** - "Habla ahora", "Procesando..."
3. **Manejo de errores graceful** - Explicar qué salió mal
4. **Fallback a texto** - Siempre permitir búsqueda manual
5. **Privacidad** - Explicar que no se almacena audio

### Performance

1. **Debounce** - Evitar múltiples grabaciones simultáneas
2. **Cleanup** - Liberar recursos cuando el componente se desmonta
3. **Error boundaries** - Capturar errores de Speech API
4. **Lazy loading** - Cargar Speech API solo cuando se necesita

## 🔐 Consideraciones de Privacidad

### Datos del Usuario

- ✅ **No se almacena audio** - Solo se procesa en tiempo real
- ✅ **Transcripción local** - Procesado por el navegador
- ✅ **Sin envío a servidores** - Todo funciona offline
- ⚠️ **Permisos de micrófono** - Se requiere autorización del usuario

### Recomendaciones

1. Informar claramente sobre el uso del micrófono
2. Permitir revocar permisos fácilmente
3. No grabar sin consentimiento explícito
4. Ofrecer alternativas sin voz para usuarios que prefieran privacidad
