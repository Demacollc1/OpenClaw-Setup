# 06 · Bot operador (Telegram → WhatsApp)

Objetivo: que **varias personas** puedan enviar WhatsApp desde el número corporativo, escribiendo en Telegram. Materializa el modelo "un número, un equipo".

Estado: **workflow entregado** (JSON `centinela-operador-telegram-wa.json`); pendiente confirmar prueba del usuario.

## Decisión de diseño
**Bot NUEVO dedicado** (no el bot de casos), para evitar el límite de "un solo trigger de Telegram por bot".

## Workflow (3 nodos)
```
Telegram Trigger (message) → Code "Procesar y enviar (Wazzup)" → Telegram "Confirmar"
```
El Code: valida allowlist, parsea comando, envía por Wazzup (`POST /v3/message`), devuelve `{chatId, aviso}`. Un solo `sendMessage` confirma o avisa error.

## Uso
`/wa <numero> <mensaje>`  (número con código de país, sin `+` ni espacios)
Ej: `/wa 593993066206 Buenas tardes, su cotización está lista.`

## Autorización (allowlist)
En el Code node:
```js
const ALLOW = ['7505702099', '1493110705']; // IDs de Telegram autorizados
```
Para agregar a alguien: que escriba a **@userinfobot**, copie su ID, se añade al array.
Si un no-autorizado escribe, el bot le devuelve su propio ID (fácil de copiar).

## Config en el workflow
- Credencial Telegram del **bot operador** (nueva, creada con @BotFather) en Trigger y en Confirmar (aparecen como "REEMPLAZAR" al importar).
- En el Code: `KEY` (API Wazzup) y `CHANNEL` = `bb4d4d3a-b215-4e8d-972b-3b4c9d9d6733`.

## No genera bucle
El eco de Wazzup (`isEcho:true`) ya se filtra en "Normalizar entrada", así que lo enviado por operador no entra al responder automático.

## Mejora opcional
"Modo conversación": `/chat <numero>` abre el destinatario, luego se escribe normal hasta `/fin`. Requiere Data Table `sesiones_operador`. También: responder directo sobre la notificación de un caso.
