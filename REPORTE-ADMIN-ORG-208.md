# Reporte consolidado — Administrador Organización

Fecha de corte: 28 de octubre de 2026  
Fuente del conteo: panel Athenea QA / Firebase `rolAdminOrg`  
Automatización: Playwright con Google Chrome

## Resumen

| Estado | Casos |
|---|---:|
| Aprobados | 201 |
| Fallados | 3 |
| Bloqueados | 4 |
| Pendientes | 0 |
| Aplicables | 208 |
| No aplica | 30 |
| Catálogo total | 238 |

## Casos fallados

| ID | Caso | Resultado |
|---|---|---|
| M03-06-6 | Editar adjunto de tarea | El nombre se actualiza, pero la descripción se pierde al recargar. Reproducido manualmente y en Playwright. |
| M08-07-6 | Eliminar artículo | Se confirma la eliminación, pero el artículo sigue visible después de recargar la administración. |
| M13-13-6 | Cancelar notificación en cola | El envío devuelve HTTP 500; no se crea el historial y no aparece el botón Cancelar. |

## Casos bloqueados

| ID | Caso | Motivo |
|---|---|---|
| M11-07-6 | Aceptar invitación | Requiere controlar un buzón externo. Manualmente funciona; falta un buzón QA o token controlado para automatizarlo. |
| M15-05-6 | Reintentar procesamiento de reunión | No existe una reunión en estado Error ni aparece el botón Reintentar. |
| M17-04-6 | Solicitar factura CFDI | El historial no contiene pagos registrados; falta un pago QA previo. |
| M17-06-6 | Reintentar timbrado | No hay factura con error de timbrado ni botón Reintentar; falta generar el fixture del PAC. |

## Observaciones

- El caso de cambio de contraseña de Administrador Organización (`M00-05-6`) está aprobado y restaura la contraseña original al terminar.
- Los casos N/A no forman parte de las 208 pruebas aplicables.
- El panel es la fuente oficial del estado; Playwright conserva la evidencia técnica de las ejecuciones automatizadas.
