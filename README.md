# Automatización QA Athenea

Proyecto nuevo para automatizar los casos aprobados del panel Ribbit QA.

## Primer caso

`M00-01-7` — Super Administrador — Consultar lecturas del módulo.

## Configuración

PowerShell (la URL ya está configurada por defecto):

```powershell
$env:ATHENEA_BASE_URL = "https://ribbit.com.mx:8089"
$env:ATHENEA_USER = "admin@demo.com"
$env:ATHENEA_PASSWORD = "NO_GUARDAR_EN_EL_REPOSITORIO"
npx playwright install chromium
npm test
```

La prueba inicial puede requerir ajustar los selectores de login después de observar la primera ejecución.
