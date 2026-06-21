# Registrar el chatbot de Open Lines (imbot) en Bitrix24

El workflow de n8n responde los chats a través de un **chatbot** de Bitrix24. Hay
que registrarlo **una sola vez** con `imbot.register`, indicando que el handler de
mensajes es la URL del Webhook de n8n.

## 1. Obtener la URL del Webhook de n8n
Abre el workflow `demaco-bot-ollama-n8n.json` en n8n, entra al nodo
**"Webhook (imbot Bitrix24)"** y copia la **Production URL**. Tendrá esta forma:

```
https://TU-N8N/webhook/demaco-bot
```

> El workflow debe estar **Activo** para que la Production URL responda.

## 2. Llamar a imbot.register
Reemplaza `BITRIX_WEBHOOK_URL` por tu webhook ENTRANTE (con permisos `imbot`, `im`,
`imopenlines`, `crm`) y `N8N_URL` por la URL del paso 1. Ejecuta desde tu terminal:

```bash
curl -X POST "https://TUCUENTA.bitrix24.es/rest/1/XXXXXXXX/imbot.register.json" \
  -H "Content-Type: application/json" \
  -d '{
    "CODE": "roberth_demaco",
    "TYPE": "O",
    "OPENLINE": "Y",
    "EVENT_MESSAGE_ADD": "https://N8N_URL/webhook/demaco-bot",
    "EVENT_WELCOME_MESSAGE": "https://N8N_URL/webhook/demaco-bot",
    "EVENT_BOT_DELETE": "https://N8N_URL/webhook/demaco-bot",
    "PROPERTIES": {
      "NAME": "Roberth",
      "COLOR": "AQUA",
      "EMAIL": "ventas@demaco.ec",
      "WORK_POSITION": "Asistente comercial"
    }
  }'
```

La respuesta incluye `"result": <BOT_ID>`. **Guarda ese número** en la variable
`BITRIX_BOT_ID` de n8n.

## 3. Obtener el application_token
Bitrix24 incluye `auth[application_token]` en cada evento que envía al bot. Para
conocerlo:

- Dispara un primer mensaje de prueba al bot y revisa el log de ejecución del nodo
  **"Parsear evento"** en n8n: ahí verás el campo `appToken`.
- Copia ese valor en la variable `BITRIX_OUTBOUND_TOKEN` (el nodo "Validar evento"
  rechaza cualquier petición cuyo token no coincida).

## 4. Conectar el bot al Canal Abierto
En Bitrix24: **Contact Center > Canales Abiertos (Open Lines)** > tu canal >
pestaña de configuración del bot/derivación, y asigna el bot **Roberth** para que
atienda los mensajes entrantes (WhatsApp, web, Telegram, etc.).

## Métodos REST que usa el workflow
- `imbot.message.add` — enviar la respuesta al chat.
- `imopenlines.bot.session.operator` — transferir la sesión a un asesor humano.
- `crm.duplicate.findbycomm` — detectar si el contacto ya existe (nuevo vs. existente).
- `crm.lead.add` — crear el lead de un prospecto nuevo.
- `crm.contact.update` — actualizar la ficha de un cliente existente.

## Para eliminar el bot (si necesitas re-registrar)
```bash
curl -X POST "https://TUCUENTA.bitrix24.es/rest/1/XXXXXXXX/imbot.unregister.json" \
  -H "Content-Type: application/json" -d '{ "BOT_ID": BOT_ID }'
```
