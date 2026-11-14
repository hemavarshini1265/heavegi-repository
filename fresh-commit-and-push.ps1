$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Hemavarshini\Music\heavegi-platforms'

$git = 'C:\Users\Hemavarshini\AppData\Local\Programs\Git\cmd\git.exe'
$gh = 'C:\Users\Hemavarshini\AppData\Local\Programs\gh\gh.exe'

Write-Host "Configuring gh credentials for Git..."
& $gh auth setup-git

Write-Host "Re-initializing fresh clean Git repository..."
if (Test-Path '.git') {
    Remove-Item -Path '.git' -Recurse -Force
}

& $git init -b main
& $git config user.name "Hemavarshini"
& $git config user.email "hemavarshiniselvakumar@gmail.com"
& $git remote add origin "https://github.com/hemavarshini1265/heavegi-repository.git"

Write-Host "Staging all frontend (client/), backend (server/), and configs..."
& $git add -A

Write-Host "Creating clean initial commit..."
$msg = "feat: Heavegi Platforms - Complete Indian E-Commerce, AI Assistant, SQL FAQs, and Render Deployment"
& $git commit -m $msg

Write-Host "Pushing main branch to GitHub..."
& $git push -u origin main --force

Write-Host "SUCCESS! Repository pushed cleanly to GitHub."
