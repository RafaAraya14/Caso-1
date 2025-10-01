/**
 * Demo Simple de FASE 2 - Pruebas Básicas
 * 
 * Script simple para probar las implementaciones principales
 */

/* eslint-disable no-console */

import {
  addDays,
  formatDate,
  formatDateTime,
  isToday
} from '../utils/dateFormatter';
import {
  formatCurrency,
  formatRating
} from '../utils/numberFormatter';
import {
  capitalize,
  formatCoachName,
  maskEmail
} from '../utils/stringFormatter';

async function testDateUtilities(): Promise<void> {
  try {
    const now = new Date();
    const future = addDays(now, 7);
    
    console.log('✅ formatDate:', formatDate(now));
    console.log('✅ formatDateTime:', formatDateTime(now));
    console.log('✅ addDays funciona:', future > now);
    console.log('✅ isToday:', isToday(now));
  } catch (error) {
    console.log('❌ Error en Date Utilities:', error instanceof Error ? error.message : String(error));
  }
}

async function testStringUtilities(): Promise<void> {
  try {
    console.log('✅ capitalize:', capitalize('hello world'));
    console.log('✅ formatCoachName:', formatCoachName('ana', 'garcía'));
    console.log('✅ maskEmail:', maskEmail('usuario@ejemplo.com'));
  } catch (error) {
    console.log('❌ Error en String Utilities:', error instanceof Error ? error.message : String(error));
  }
}

async function testNumberUtilities(): Promise<void> {
  try {
    console.log('✅ formatCurrency:', formatCurrency(1234.56));
    console.log('✅ formatRating:', formatRating(4.8567));
  } catch (error) {
    console.log('❌ Error en Number Utilities:', error instanceof Error ? error.message : String(error));
  }
}

async function runBasicTests(): Promise<void> {
  console.log('🧪 Ejecutando Pruebas Básicas de FASE 2\n');

  console.log('1️⃣ Testing Date Utilities...');
  await testDateUtilities();

  console.log('\n2️⃣ Testing String Utilities...');
  await testStringUtilities();

  console.log('\n3️⃣ Testing Number Utilities...');
  await testNumberUtilities();

  console.log('\n🎉 Pruebas básicas completadas!');
  console.log('\n📋 Para ver más ejemplos detallados:');
  console.log('   - Revisa docs/Background-Jobs-Examples.md');
  console.log('   - Revisa docs/Design-Patterns-Documentation.md');
  console.log('   - Revisa docs/UX-Testing-Results.md');
}

// Ejecutar pruebas solo si se ejecuta directamente
if (require.main === module) {
  runBasicTests().catch(console.error);
}

export { runBasicTests };
