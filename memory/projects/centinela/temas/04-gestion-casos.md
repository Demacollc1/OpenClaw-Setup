# 04 · Gestión de casos

Estado: **funcionando** (incluye cierre manual y auto-cierre).

## Concepto
Un "caso" agrupa un hilo de conversación con contexto, estado y tipo. Tabla `casos` (`YC1DfD6CPTm5UNUH`).

## Agrupación de hilos
- Un hilo puede tener **varias interacciones** antes de descubrir el tipo de caso.
- Se agrupan por referencia (`ref`); flag booleano `hay_caso` indica si existe caso abierto.

## Clasificación del tipo de caso
El LLM clasifica el tipo (ej. cobranza, cotización, reclamo, soporte, etc.).
- Al continuar un caso se **preserva `tipoCasoPrevio`** (no sobrescribir a "otras" en cierres genéricos).

## Cierre inteligente (auto + manual)
- **Auto por confirmación:** la IA pregunta "¿necesitas algo más o eso sería todo?" y cierra si confirman.
- **Auto por inactividad:** `scheduleTrigger` cierra por inactividad (12h/24h).
- **Manual:** botón en Telegram (inline keyboard) → `answerCallbackQuery` / `editMessageText` → actualiza tabla `casos`.

## Gotcha importante (Telegram)
Solo puede haber **UN trigger de Telegram por bot**. El cierre manual falló por tener varios triggers/handlers; se resolvió dejando **solo el handler v3 activo** y re-registrando el webhook (toggle off/on del workflow).

## Notificación de nuevo caso
Nodo que avisa al gerente por Telegram cuando se abre un caso.
