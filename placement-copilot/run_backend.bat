@echo off

REM ------------------------------------------------------------
REM  Quick starter for the Placement‑Copilot Spring‑Boot backend
REM  Uses the Maven wrapper bundled in the repository.
REM ------------------------------------------------------------

REM Change to the backend project directory (where pom.xml lives)
cd "%~dp0backend"

REM Execute Maven with the correct goal. The call operator "&" is not needed in a .bat file.
"C:\Users\ADMIN\OneDrive\Desktop\Aicopilot\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
