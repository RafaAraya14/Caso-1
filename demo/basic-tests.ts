/**
 * Demo Simple de FASE 2 - Pruebas Básicas
 * 
 * Script simple para probar las implementaciones principales
 */

// Importaciones básicas que sabemos que funcionan
import { ConfigManager } from '../src/utils/ConfigManager';
import { CacheManager } from '../src/utils/CacheManager';
import { EventBus } from '../src/background/EventBus';
import { 
  formatDate, 
  formatDateTime, 
  addDays, 
  isToday 
} from '../src/utils/dateFormatter';
import { 
  capitalize, 
  formatCoachName, 
  maskEmail 
} from '../src/utils/stringFormatter';
import { 
  formatCurrency, 
  formatRating 
} from '../src/utils/numberFormatter';

async function runBasicTests() {
  console.log('🧪 Ejecutando Pruebas Básicas de FASE 2\n');

  // Test 1: Singletons
  console.log('1️⃣ Testing Singletons...');
  try {
    const config1 = ConfigManager.getInstance();
    const config2 = ConfigManager.getInstance();
    console.log('   ✅ ConfigManager es Singleton:', config1 === config2);

    const cache1 = CacheManager.getInstance();
    const cache2 = CacheManager.getInstance();
    console.log('   ✅ CacheManager es Singleton:', cache1 === cache2);

    const event1 = EventBus.getInstance();
    const event2 = EventBus.getInstance();
    console.log('   ✅ EventBus es Singleton:', event1 === event2);
  } catch (error) {
    console.log('   ❌ Error en Singletons:', error.message);
  }

  // Test 2: ConfigManager
  console.log('\n2️⃣ Testing ConfigManager...');
  try {
    const config = ConfigManager.getInstance();
    await config.initialize();
    
    // Test configuración básica
    config.set('test.value', 'Hello World');
    const value = config.get('test.value');
    console.log('   ✅ Set/Get funciona:', value === 'Hello World');
    
    // Test con valor por defecto
    const defaultValue = config.getWithDefault('nonexistent.key', 'default');
    console.log('   ✅ Default value funciona:', defaultValue === 'default');
    
  } catch (error) {
    console.log('   ❌ Error en ConfigManager:', error.message);
  }

  // Test 3: CacheManager
  console.log('\n3️⃣ Testing CacheManager...');
  try {
    const cache = CacheManager.getInstance();
    
    // Cache básico
    cache.set('test-key', { name: 'Test User', id: 123 });
    const cached = cache.get('test-key');
    console.log('   ✅ Cache básico funciona:', cached?.name === 'Test User');
    
    // Cache con TTL
    cache.set('temp-key', 'temporal', { ttl: 1000 });
    const tempValue = cache.get('temp-key');
    console.log('   ✅ Cache con TTL funciona:', tempValue === 'temporal');
    
    // Estadísticas
    const stats = cache.getStats();
    console.log('   ✅ Stats disponibles:', typeof stats.totalItems === 'number');
    
  } catch (error) {
    console.log('   ❌ Error en CacheManager:', error.message);
  }

  // Test 4: EventBus
  console.log('\n4️⃣ Testing EventBus...');
  try {
    const eventBus = EventBus.getInstance();
    let eventReceived = false;
    
    // Suscribirse a evento
    const unsubscribe = eventBus.subscribe('test-event', (data) => {
      eventReceived = true;
      console.log('   📨 Evento recibido:', data.message);
    });
    
    // Publicar evento
    eventBus.publish('test-event', { message: 'Test message' });
    
    // Verificar que se recibió
    setTimeout(() => {
      console.log('   ✅ EventBus funciona:', eventReceived);
      
      // Limpiar suscripción
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    }, 10);
    
  } catch (error) {
    console.log('   ❌ Error en EventBus:', error.message);
  }

  // Test 5: Date Utilities
  console.log('\n5️⃣ Testing Date Utilities...');
  try {
    const now = new Date();
    const future = addDays(now, 7);
    
    console.log('   ✅ formatDate:', formatDate(now));
    console.log('   ✅ formatDateTime:', formatDateTime(now));
    console.log('   ✅ addDays funciona:', future > now);
    console.log('   ✅ isToday:', isToday(now));
    
  } catch (error) {
    console.log('   ❌ Error en Date Utilities:', error.message);
  }

  // Test 6: String Utilities
  console.log('\n6️⃣ Testing String Utilities...');
  try {
    console.log('   ✅ capitalize:', capitalize('hello world'));
    console.log('   ✅ formatCoachName:', formatCoachName('ana', 'garcía'));
    console.log('   ✅ maskEmail:', maskEmail('usuario@ejemplo.com'));
    
  } catch (error) {
    console.log('   ❌ Error en String Utilities:', error.message);
  }

  // Test 7: Number Utilities
  console.log('\n7️⃣ Testing Number Utilities...');
  try {
    console.log('   ✅ formatCurrency:', formatCurrency(1234.56));
    console.log('   ✅ formatRating:', formatRating(4.8567));
    
  } catch (error) {
    console.log('   ❌ Error en Number Utilities:', error.message);
  }

  console.log('\n🎉 Pruebas básicas completadas!');
  console.log('\n📋 Para ver más ejemplos detallados:');
  console.log('   - Revisa docs/Background-Jobs-Examples.md');
  console.log('   - Revisa docs/Design-Patterns-Documentation.md');
  console.log('   - Revisa docs/UX-Testing-Results.md');
}

// Ejecutar pruebas
runBasicTests().catch(console.error);

export { runBasicTests };