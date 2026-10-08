# 02 · Wazzup (WhatsApp) — recibir y enviar

Estado: **EN VIVO y funcionando** (el usuario confirmó "si llegó").

## Canal
- Canal activo: `bb4d4d3a-b215-4e8d-972b-3b4c9d9d6733` (número 593993066206).
- Otros canales figuran en estado `blocked` = desactivados en la cuenta Wazzup (suscripción/pausa), **NO es ban de WhatsApp** (el usuario corrigió este punto).

## Recibir (webhook entrante)
Wazzup v3 envía a un webhook de n8n. Payload: `body.messages[]` con campos:
`chatId`, `text`, `type`, `contact.name`, `contact.phone`, `isEcho`, `channelId`, `status`.

**Nodo "Normalizar entrada"** (Code) adapta tanto el formato Wazzup como un formato simulado:
- Si `body.telefono` → formato simulado.
- Si `body.messages[]` → recorre, **ignora `isEcho===true`** (evita bucles), solo `type==='text'`, status inbound, y arma `{telefono, nombre, mensaje, channelId, _origen:'wazzup'}`.

## Enviar (respuesta saliente)
Nodo "Enviar respuesta (Wazzup)" (Code): `POST https://api.wazzup24.com/v3/message`
```
headers: Authorization: Bearer <KEY>
body: { channelId, chatType:'whatsapp', chatId: telefono, text: reply }
```
Solo envía cuando `origen==='wazzup'`. La KEY está inline en el nodo (`$env.WAZZUP_API_KEY || '...'`). **Regenerar key** (quedó expuesta).

## API Wazzup v3 (referencia)
- `GET/PATCH /v3/webhooks` — gestionar suscripción webhook.
- `POST /v3/message` — enviar.
