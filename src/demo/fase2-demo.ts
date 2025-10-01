/**
 * Demo de las implementaciones FASE 2
 * 
 * Este archivo demuestra cómo usar las utilidades implementadas en FASE 2
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

export class Fase2Demo {
  
  constructor() {
    console.log('🚀 Iniciando Demo FASE 2 - Utilidades');
  }

  public async runAllDemos(): Promise<void> {
    console.log('\n📅 Demo de Date Utilities');
    await this.runDateUtilitiesDemo();

    console.log('\n💰 Demo de Number Utilities');
    await this.runNumberUtilitiesDemo();

    console.log('\n✨ Demo de String Utilities');
    await this.runStringUtilitiesDemo();

    console.log('\n🎉 Demo FASE 2 completado exitosamente!');
  }

  private async runDateUtilitiesDemo(): Promise<void> {
    try {
      const now = new Date();

      console.log('  📊 Pruebas de formateo de fechas:');
      console.log(`     - Fecha actual: ${formatDate(now)}`);
      console.log(`     - Fecha y hora: ${formatDateTime(now)}`);
      console.log(`     - Es hoy: ${isToday(now)}`);
      console.log(`     - Fecha futura: ${formatDate(addDays(now, 7))}`);
    } catch (error) {
      console.log('  ❌ Error en Date Utilities:', error instanceof Error ? error.message : String(error));
    }
  }

  private async runNumberUtilitiesDemo(): Promise<void> {
    try {
      console.log('  📊 Pruebas de formateo de números:');
      console.log(`     - Precio: ${formatCurrency(1250.75)}`);
      console.log(`     - Rating: ${formatRating(4.8567)}`);
    } catch (error) {
      console.log('  ❌ Error en Number Utilities:', error instanceof Error ? error.message : String(error));
    }
  }

  private async runStringUtilitiesDemo(): Promise<void> {
    try {
      console.log('  📊 Pruebas de formateo de strings:');
      console.log(`     - Capitalizar: ${capitalize('hola mundo')}`);
      console.log(`     - Nombre coach: ${formatCoachName('maría', 'gonzález')}`);
      console.log(`     - Email enmascarado: ${maskEmail('usuario@ejemplo.com')}`);
    } catch (error) {
      console.log('  ❌ Error en String Utilities:', error instanceof Error ? error.message : String(error));
    }
  }
}

// Función para ejecutar el demo
async function runFase2Demo(): Promise<void> {
  const demo = new Fase2Demo();
  await demo.runAllDemos();
}

// Ejecutar demo solo si se ejecuta directamente
if (require.main === module) {
  runFase2Demo().catch(console.error);
}

export { runFase2Demo };
