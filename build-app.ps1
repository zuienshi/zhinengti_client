# Build Script for AI Agent Application
Write-Host "Building AI Agent Application..." -ForegroundColor Green

# Create output directory
$outputDir = "build\AI-Agent-win32-x64"
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# Copy Electron runtime
Write-Host "Copying Electron runtime..." -ForegroundColor Yellow
Copy-Item "node_modules\electron\dist\*" -Destination $outputDir -Recurse -Force

# Rename electron.exe
Rename-Item "$outputDir\electron.exe" "AI-Agent.exe" -Force

# Create resources\app directory
$appDir = "$outputDir\resources\app"
if (Test-Path $appDir) {
    Remove-Item $appDir -Recurse -Force
}
New-Item -ItemType Directory -Path $appDir -Force | Out-Null

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow
Copy-Item "dist" -Destination $appDir -Recurse -Force
Copy-Item "main.js" -Destination $appDir -Force
Copy-Item "preload.js" -Destination $appDir -Force
Copy-Item "package.json" -Destination $appDir -Force

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Application location: $outputDir\AI-Agent.exe" -ForegroundColor Cyan
