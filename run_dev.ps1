# Script untuk menjalankan Flask dengan environment variables
# Cara pakai: .\run_dev.ps1

Write-Host "Setting environment variables..." -ForegroundColor Green

$env:DATABASE_HOST = "aws-0-ap-southeast-1.pooler.supabase.com"
$env:DB_NAME = "postgres"
$env:DB_USER = "postgres.wtmfsznnmyinbgzkdofz"
$env:DB_PASSWORD = "palaparingproject12345"
$env:DB_PORT = "6543"

Write-Host "Environment variables set!" -ForegroundColor Green
Write-Host "Starting Flask server..." -ForegroundColor Cyan

python app.py
