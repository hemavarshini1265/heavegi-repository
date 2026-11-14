@echo off
echo ========================================================
echo  HEAVEGI PLATFORMS - PUSH TO GITHUB REPOSITORY
echo ========================================================
echo.
echo Make sure you have created the repository on GitHub:
echo https://github.com/hemavarshini1265/heavegi-repository
echo.
set /p TOKEN="Enter your GitHub Personal Access Token (PAT): "
if "%TOKEN%"=="" (
    echo No token provided. Aborting.
    pause
    exit /b 1
)

echo.
echo Setting remote URL with authentication...
"C:\Users\Hemavarshini\AppData\Local\Programs\Git\cmd\git.exe" remote set-url origin https://%TOKEN%@github.com/hemavarshini1265/heavegi-repository.git

echo Pushing main branch to GitHub...
"C:\Users\Hemavarshini\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo SUCCESS! Repository pushed to:
    echo https://github.com/hemavarshini1265/heavegi-repository
    echo ========================================================
) else (
    echo.
    echo Push failed. Please verify that your token has 'repo' scope.
)
pause

