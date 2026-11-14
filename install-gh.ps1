$ErrorActionPreference = 'Stop'
$destDir = 'C:\Users\Hemavarshini\AppData\Local\Programs\gh'
$zipPath = 'C:\Users\Hemavarshini\AppData\Local\Temp\gh.zip'

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

Write-Host "Downloading GitHub CLI (gh.exe)..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = 'https://github.com/cli/cli/releases/download/v2.62.0/gh_2.62.0_windows_amd64.zip'
Invoke-WebRequest -Uri $url -OutFile $zipPath

Write-Host "Extracting GitHub CLI..."
$tempExtract = 'C:\Users\Hemavarshini\AppData\Local\Temp\gh_extracted'
Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force

$ghBin = Get-ChildItem -Path $tempExtract -Recurse -Filter 'gh.exe' | Select-Object -First 1
Move-Item -Path $ghBin.FullName -Destination $destDir -Force

Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item -Path $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Adding gh to User PATH..."
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$destDir*") {
    $newUserPath = "$userPath;$destDir"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
}

Write-Host "Testing gh..."
$env:Path = "$destDir;$env:Path"
$ver = & "$destDir\gh.exe" --version
Write-Host "Success: $ver"
