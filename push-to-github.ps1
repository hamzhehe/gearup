# Push GearUp to GitHub (excludes .env and other secrets via .gitignore)
# Run from PowerShell:  cd e:\GearUp2\GearUp  then  .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Checking git..." -ForegroundColor Cyan
git --version

if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
}

Write-Host "Verifying sensitive files are ignored..." -ForegroundColor Cyan
$sensitive = @(
    "backend\.env",
    "backend\config\agent-name-nsnl-16d61ab084a0.json"
)
foreach ($file in $sensitive) {
    if (Test-Path $file) {
        $check = git check-ignore -v $file 2>$null
        if (-not $check) {
            Write-Error "FAIL: $file is NOT ignored. Fix .gitignore before pushing."
        }
        Write-Host "  OK ignored: $file" -ForegroundColor Green
    }
}

$remoteUrl = "https://github.com/hamzhehe/gearup.git"
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
    Write-Host "Added remote: $remoteUrl" -ForegroundColor Green
} elseif ($existing -ne $remoteUrl) {
    git remote set-url origin $remoteUrl
    Write-Host "Updated remote to: $remoteUrl" -ForegroundColor Green
}

Write-Host "Staging files..." -ForegroundColor Cyan
git add .

Write-Host "Files that will be committed (sample):" -ForegroundColor Cyan
git diff --cached --name-only | Select-Object -First 30

if (git diff --cached --name-only | Select-String -Pattern "\.env$|\.env\.") {
    Write-Error "ABORT: .env file detected in staging area. Unstage and fix .gitignore."
}

$status = git status --short
if (-not $status) {
    Write-Host "Nothing new to commit." -ForegroundColor Yellow
} else {
    git commit -m "Initial commit: GearUp marketplace platform"
    Write-Host "Committed successfully." -ForegroundColor Green
}

Write-Host "Pushing to origin main..." -ForegroundColor Cyan
git push -u origin main

Write-Host "Done! Repository: $remoteUrl" -ForegroundColor Green
