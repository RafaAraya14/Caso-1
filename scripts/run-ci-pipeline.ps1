# Script para simular el pipeline de CI/CD localmente
# Ejecuta los mismos comandos que GitHub Actions

Write-Host "🚀 Simulando Pipeline de CI/CD - 20minCoach" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 1. Verificar instalación de dependencias
Write-Host "`n📦 Paso 1: Instalando dependencias..." -ForegroundColor Yellow
npm ci

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en instalación de dependencias" -ForegroundColor Red
    exit 1
}

# 2. Verificar linting
Write-Host "`n🔍 Paso 2: Ejecutando ESLint..." -ForegroundColor Yellow
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de linting encontrados" -ForegroundColor Red
    Write-Host "💡 Ejecuta 'npm run lint -- --fix' para corregir automáticamente" -ForegroundColor Blue
    exit 1
}

# 3. Ejecutar build
Write-Host "`n🏗️ Paso 3: Construyendo proyecto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 4. Ejecutar tests (si existen)
Write-Host "`n🧪 Paso 4: Ejecutando tests..." -ForegroundColor Yellow
if (Test-Path "src/**/*.test.*") {
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests fallaron" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ No se encontraron tests - Considera agregar tests unitarios" -ForegroundColor Yellow
}

Write-Host "`n✅ Pipeline completado exitosamente!" -ForegroundColor Green
Write-Host "🎉 El proyecto está listo para deployment" -ForegroundColor Green