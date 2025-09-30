# Verificador de calidad de código - Simula las verificaciones del pipeline
Write-Host "🎯 Verificador de Calidad de Código" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Función para mostrar estadísticas
function Show-Stats {
    param($title, $passed, $total)
    $percentage = [math]::Round(($passed / $total) * 100, 1)
    $color = if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" }
    Write-Host "$title`: $passed/$total ($percentage%)" -ForegroundColor $color
}

# Verificar ESLint
Write-Host "`n🔍 Analizando código con ESLint..." -ForegroundColor Yellow
$lintOutput = npm run lint 2>&1
$lintErrors = ($lintOutput | Select-String "error").Count
$lintWarnings = ($lintOutput | Select-String "warning").Count
$totalIssues = $lintErrors + $lintWarnings

Write-Host "Errores: $lintErrors" -ForegroundColor $(if ($lintErrors -eq 0) { "Green" } else { "Red" })
Write-Host "Advertencias: $lintWarnings" -ForegroundColor $(if ($lintWarnings -eq 0) { "Green" } else { "Yellow" })

# Verificar archivos TypeScript
Write-Host "`n📊 Estadísticas del proyecto..." -ForegroundColor Yellow
$tsFiles = (Get-ChildItem -Path "src" -Filter "*.ts*" -Recurse).Count
$jsFiles = (Get-ChildItem -Path "src" -Filter "*.js*" -Recurse | Where-Object { $_.Name -notlike "*.ts*" }).Count
$totalFiles = $tsFiles + $jsFiles

Write-Host "Archivos TypeScript: $tsFiles"
Write-Host "Archivos JavaScript: $jsFiles"
Show-Stats "Adopción TypeScript" $tsFiles $totalFiles

# Verificar estructura de carpetas
Write-Host "`n📁 Verificando estructura del proyecto..." -ForegroundColor Yellow
$requiredFolders = @("components", "hooks", "services", "types", "utils")
$existingFolders = @()

foreach ($folder in $requiredFolders) {
    if (Test-Path "src/$folder") {
        $existingFolders += $folder
        Write-Host "✅ $folder/" -ForegroundColor Green
    } else {
        Write-Host "❌ $folder/" -ForegroundColor Red
    }
}

Show-Stats "Estructura de carpetas" $existingFolders.Count $requiredFolders.Count

# Verificar archivos de configuración
Write-Host "`n⚙️ Verificando configuración..." -ForegroundColor Yellow
$configFiles = @(
    @{Name=".eslintrc.js"; Description="ESLint"},
    @{Name="tsconfig.json"; Description="TypeScript"},
    @{Name="package.json"; Description="NPM"},
    @{Name=".prettierrc.json"; Description="Prettier"}
)

$configCount = 0
foreach ($config in $configFiles) {
    if (Test-Path $config.Name) {
        Write-Host "✅ $($config.Description)" -ForegroundColor Green
        $configCount++
    } else {
        Write-Host "❌ $($config.Description)" -ForegroundColor Red
    }
}

Show-Stats "Archivos de configuración" $configCount $configFiles.Count

# Resumen final
Write-Host "`n📋 Resumen de Calidad" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

if ($lintErrors -eq 0 -and $lintWarnings -lt 50) {
    Write-Host "🎉 ¡Excelente calidad de código!" -ForegroundColor Green
} elseif ($lintErrors -lt 5 -and $lintWarnings -lt 100) {
    Write-Host "✅ Buena calidad de código con mejoras menores" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ Necesita mejoras en la calidad del código" -ForegroundColor Red
}

Write-Host "`nPróximos pasos sugeridos:" -ForegroundColor Blue
if ($lintErrors -gt 0) {
    Write-Host "- Corregir $lintErrors errores de ESLint" -ForegroundColor Red
}
if ($lintWarnings -gt 20) {
    Write-Host "- Revisar y corregir advertencias principales" -ForegroundColor Yellow
}
Write-Host "- Agregar tests unitarios para mejorar cobertura" -ForegroundColor Blue
Write-Host "- Considerar agregar documentación JSDoc" -ForegroundColor Blue