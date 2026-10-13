@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Windows
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL LEAVE_ENVIRONMENT

SET ERROR_CODE=0
SET MAVEN_PROJECTBASEDIR=%~dp0
IF NOT "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%\

IF NOT EXIST "%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties" (
    ECHO Error: Could not find .mvn\wrapper\maven-wrapper.properties
    EXIT /B 1
)

@REM Search for mvn command in system
WHERE mvn >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    mvn %*
    EXIT /B %ERRORLEVEL%
)

ECHO Executing Maven through wrapper...
IF EXIST "%USERPROFILE%\.m2\wrapper\dists" (
    FOR /R "%USERPROFILE%\.m2\wrapper\dists" %%F IN (mvn.cmd) DO (
        IF EXIST "%%F" (
            "%%F" %*
            EXIT /B %ERRORLEVEL%
        )
    )
)

ECHO Maven wrapper running...
java -version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
    EXIT /B 1
)

IF "%JAVA_HOME%" == "" (
    SET "JAVACMD=java"
) ELSE (
    SET "JAVACMD=%JAVA_HOME%\bin\java"
)

"%JAVACMD%" -jar "%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar" %*
EXIT /B %ERRORLEVEL%
