SET BASEDIR=%CD%
SET PROFILE=%BASEDIR%\profiles\app.profile.js
SET DISTDIR=%BASEDIR%\dist
SET DISTDIR=%DISTDIR:\=/%
SET SRCDIR=%BASEDIR%\src

cd %BASEDIR%\src\util\buildscripts

rmdir /s /q %DISTDIR%
mkdir %DISTDIR%

start /WAIT build --profile %PROFILE% --releaseDir %DISTDIR%

cd %DISTDIR%

del /s /q *.uncompressed.js
del /s /q *.consoleStripped.js

cd %BASEDIR%

REM type %SRCDIR%\index.html|perl -pe "s/<script data-dojo.*?<\/script>/<script src='dojo\/dojo\.js' data-dojo-config=\"deps:['app\/run']\"><\/script>/;s/<script src=\'app.*?<\/script>//;s/<\!--.*?-->//g;s/\s+/ /g;">"%DISTDIR%/index.html"

pause
