@echo off
echo ========================================
echo   GitHub Upload Script
echo   Hand Gesture Sound Manipulation
echo ========================================
echo.

REM Configure Git user (for commits)
echo [0/7] Configuring Git user...
git config user.name "Nuh Hurmanlı"
git config user.email "2004nuh@gmail.com"
echo Git user configured: Nuh Hurmanlı (2004nuh@gmail.com)
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/7] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize git repository
    pause
    exit /b 1
)

echo.
echo [2/7] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo [3/7] Creating initial commit...
git commit -m "Initial commit: Hand Gesture Sound Manipulation System" -m "Interactive audio manipulation system controlled by hand gestures using MediaPipe and Web Audio API" -m "Features: 8 voice effects, 5 sound generators, real-time visualizer, recording capability" -m "Author: Nuh Hurmanlı [Future]"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)

echo.
echo [4/7] Renaming branch to main...
git branch -M main
if errorlevel 1 (
    echo ERROR: Failed to rename branch
    pause
    exit /b 1
)

echo.
echo [5/7] Adding remote repository...
git remote add origin https://github.com/Future707/hand-gesture-sound-manipulation.git
if errorlevel 1 (
    echo WARNING: Remote might already exist, removing and re-adding...
    git remote remove origin
    git remote add origin https://github.com/Future707/hand-gesture-sound-manipulation.git
)

echo.
echo [6/7] Verifying repository configuration...
echo Repository: https://github.com/Future707/hand-gesture-sound-manipulation
echo Author: Nuh Hurmanlı (2004nuh@gmail.com)
echo.

echo [7/7] Pushing to GitHub...
echo.
echo ========================================
echo   AUTHENTICATION REQUIRED
echo ========================================
echo.
echo GitHub Username: Future707
echo GitHub Password: Use Personal Access Token (NOT password!)
echo.
echo To create a token:
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token" (classic)
echo 3. Select scopes: repo (all)
echo 4. Copy the token and use it as password
echo.
echo IMPORTANT: Make sure repository exists on GitHub!
echo Create it at: https://github.com/new
echo   - Name: hand-gesture-sound-manipulation
echo   - Description: Interactive audio manipulation system controlled by hand gestures using MediaPipe and Web Audio API
echo   - Public
echo   - DON'T add README/gitignore/license
echo.
pause

git push -u origin main
if errorlevel 1 (
    echo.
    echo ========================================
    echo   PUSH FAILED!
    echo ========================================
    echo.
    echo Common solutions:
    echo 1. Repository doesn't exist - create it at:
    echo    https://github.com/new
    echo.
    echo 2. Authentication failed - use Personal Access Token:
    echo    https://github.com/settings/tokens
    echo.
    echo 3. Already pushed - use:
    echo    git push --force origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! 🎉
echo ========================================
echo.
echo Your project is now on GitHub!
echo.
echo Repository: https://github.com/Future707/hand-gesture-sound-manipulation
echo Author: Nuh Hurmanlı [Future]
echo Email: 2004nuh@gmail.com
echo.
echo Next steps:
echo 1. Visit: https://github.com/Future707/hand-gesture-sound-manipulation
echo 2. Add screenshots to README
echo 3. Enable GitHub Pages: Settings → Pages → Source: main
echo 4. Share your project!
echo.
echo Live demo will be at:
echo https://future707.github.io/hand-gesture-sound-manipulation/
echo.
pause
