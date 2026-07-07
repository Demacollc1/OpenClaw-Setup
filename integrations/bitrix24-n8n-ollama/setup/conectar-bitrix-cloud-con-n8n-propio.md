# Conectar Bitrix24 Cloud ↔ n8n en tu propio servidor

Guía end-to-end para que tu **Bitrix24 Cloud** (`tucuenta.bitrix24.es`) y tu **n8n
self-hosted** (en tu VPS/servidor) hablen en ambos sentidos.

> Doc oficial de la API: https://github.com/bitrix24/b24restdocs
> · https://apidocs.bitrix24.com

---

## 0. Cómo fluye la comunicación (los 2 sentidos)

```
                (1) evento entrante  →  HTTPS público
  Bitrix24 Cloud ─────────────────────────────────►  n8n (tu servidor)
  (chat/Open Line)                                     Webhook /webhook/demaco-bot
        ▲                                                     │
        │ (2) respuesta / acciones REST                       ▼
        └──────────────  HTTPS  ◄───────────────────  imbot.message.add, etc.
```

- **(1) Bitrix → n8n**: cuando un cliente escribe, Bitrix envía el evento
  `ONIMBOTMESSAGEADD` a la **URL pública HTTPS** del Webhook de n8n.
- **(2) n8n → Bitrix**: n8n responde llamando al **Webhook entrante** de Bitrix
  (`imbot.message.add`, `imopenlines...`, `crm...`).

**Requisito duro:** el paso (1) **obliga a HTTPS con certificado válido**. Bitrix
rechaza handlers `http://`, IP cruda o certificados self-signed
(`INVALID_REQUEST: Https required`). Tu n8n **tiene que ser público por HTTPS**.

---

## 1. Requisitos previos

| # | Requisito | Detalle |
|---|---|---|
| 1 | Servidor con n8n corriendo | Docker o npm, no importa |
| 2 | **Dominio o subdominio** apuntando al server | ej. `n8n.demaco.ec` (registro DNS `A` → IP del VPS) |
| 3 | **Certificado TLS válido** | Let's Encrypt (gratis) vía reverse proxy |
| 4 | Puertos 80/443 abiertos en el firewall | 80 solo para renovar el cert; 443 es el tráfico real |
| 5 | Ollama accesible desde n8n | misma máquina (`http://localhost:11434`) o red interna |
| 6 | Cuenta Bitrix24 **en plan comercial** | la REST de bots no está en el plan gratuito (`REST API is available only on commercial plans`) |

> Si aún **no** tienes dominio+HTTPS, no puedes conectar directo. Alternativa temporal:
> un túnel con TLS (Cloudflare Tunnel es el más estable; ngrok para pruebas). Pero
> para producción usa dominio propio.

---

## 2. Exponer n8n por HTTPS (reverse proxy + Let's Encrypt)

n8n **no** termina TLS por sí mismo; pon un reverse proxy delante. Ejemplo con
**Caddy** (el más simple: saca el cert solo).

`Caddyfile`:
```
n8n.demaco.ec {
    reverse_proxy localhost:5678
}
```

Y n8n debe conocer su URL pública para generar bien las Production URLs. En el
`docker-compose.yml` (o env del servicio):

```yaml
environment:
  - N8N_HOST=n8n.demaco.ec
  - N8N_PROTOCOL=https
  - WEBHOOK_URL=https://n8n.demaco.ec/      # ← clave: define la URL del webhook público
  - N8N_PORT=5678
```

> Alternativa con **Nginx + certbot**: `proxy_pass http://localhost:5678;` y
> `certbot --nginx -d n8n.demaco.ec`. Mismo resultado.

**Verifica** antes de seguir:
```bash
curl -I https://n8n.demaco.ec/healthz     # debe responder 200 y cert válido
```

---

## 3. Crear el Webhook ENTRANTE en Bitrix24 (n8n → Bitrix)

Es el token con el que n8n llama a la REST de Bitrix.

1. En Bitrix24: **Aplicaciones (Market/Desarrollador) → Recursos para desarrolladores
   → Otro → Webhook de entrada** (*Inbound webhook*).
2. Marca estos **permisos (scopes)**:
   - `imbot` — registrar y operar el chatbot
   - `im` — mensajería
   - `imopenlines` — transferir a asesor humano
   - `crm` — identificar/crear contacto y lead
3. Guarda. Bitrix te da una URL así:
   ```
   https://tucuenta.bitrix24.es/rest/1/abcd1234efgh5678/
   ```
   El `1` es el ID del usuario dueño; `abcd1234...` es el token.
4. Copia esa URL **sin la barra final** en la variable de n8n `BITRIX_WEBHOOK_URL`.

---

## 4. Registrar el chatbot (una sola vez)

El bot dice a Bitrix "cuando llegue un mensaje, avísale a esta URL de n8n". Esa URL
es la **Production URL** del nodo Webhook del workflow (workflow **activado**):
`https://n8n.demaco.ec/webhook/demaco-bot`.

```bash
curl -X POST "https://tucuenta.bitrix24.es/rest/1/abcd1234efgh5678/imbot.register.json" \
  -H "Content-Type: application/json" \
  -d '{
    "CODE": "roberth_demaco",
    "TYPE": "O",
    "OPENLINE": "Y",
    "EVENT_MESSAGE_ADD":     "https://n8n.demaco.ec/webhook/demaco-bot",
    "EVENT_WELCOME_MESSAGE": "https://n8n.demaco.ec/webhook/demaco-bot",
    "EVENT_BOT_DELETE":      "https://n8n.demaco.ec/webhook/demaco-bot",
    "PROPERTIES": {
      "NAME": "Roberth",
      "COLOR": "AQUA",
      "EMAIL": "ventas@demaco.ec",
      "WORK_POSITION": "Asistente comercial"
    }
  }'
```

Parámetros clave (confirmados en la doc oficial de `imbot.register`):
- `TYPE: "O"` + `OPENLINE: "Y"` → bot para **Canales Abiertos** (Open Lines).
- `EVENT_MESSAGE_ADD` → handler del evento `ONIMBOTMESSAGEADD` (**obligatorio**).
- `EVENT_WELCOME_MESSAGE` y `EVENT_BOT_DELETE` también son **obligatorios**.

Respuesta: `{ "result": 39, ... }` → **`39` es tu `BOT_ID`**. Guárdalo en la
variable `BITRIX_BOT_ID` de n8n.

> Errores típicos aquí:
> - `INVALID_REQUEST: Https required` → tu URL de n8n no es HTTPS válida (vuelve al paso 2).
> - `Wrong handler URL` → la Production URL no responde (¿workflow activado? ¿ruta correcta?).
> - `ACCESS_DENIED / commercial plans` → tu Bitrix está en plan gratuito.

---

## 5. Obtener el `application_token` (seguridad del webhook entrante)

Cada evento que Bitrix manda a n8n trae `auth[application_token]`. El workflow lo
valida para rechazar peticiones falsas.

1. Manda un mensaje de prueba al bot.
2. En n8n abre la ejecución → nodo **"Parsear evento"** → busca el campo `appToken`.
3. Copia ese valor en la variable `BITRIX_OUTBOUND_TOKEN`.

---

## 6. Conectar el bot al Canal Abierto

En Bitrix24: **Contact Center → Canales Abiertos (Open Lines) → tu canal →**
configuración de derivación/bot → asigna **Roberth**. Desde ahí atiende WhatsApp,
web-chat, Telegram, etc., según los canales que tengas conectados al Open Line.

---

## 7. Variables finales en n8n (Settings → Variables)

| Variable | Valor |
|---|---|
| `BITRIX_WEBHOOK_URL` | `https://tucuenta.bitrix24.es/rest/1/abcd1234efgh5678` |
| `BITRIX_BOT_ID` | `39` (el `result` del paso 4) |
| `BITRIX_OUTBOUND_TOKEN` | el `appToken` del paso 5 |
| `OLLAMA_URL` | `http://localhost:11434` (si Ollama está en el mismo server) |
| `OLLAMA_MODEL` | `llama3.1` (o el que hiciste `ollama pull`) |

---

## 8. Probar la conexión (checklist)

1. `curl -I https://n8n.demaco.ec/healthz` → 200 + cert válido.
2. Workflow **activado** en n8n.
3. Escribe **"¿a qué hora abren?"** en el canal → el bot responde horarios.
4. Escribe **"quiero cotizar 10 sacos"** → cortesía + transferencia a asesor.
5. Escribe **"Operador"** → transferencia inmediata.
6. Revisa la pestaña *Executions* de n8n: cada mensaje debe generar una ejecución OK.

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `imbot.register` da `Https required` | n8n no es HTTPS público válido | Reverse proxy + Let's Encrypt (paso 2) |
| Bitrix no dispara eventos | Workflow inactivo o URL mal | Activa el workflow; verifica la Production URL exacta |
| n8n recibe pero no responde | `BITRIX_WEBHOOK_URL` mal o sin scope | Revisa scopes `imbot/im/imopenlines/crm` |
| "Validar evento" rechaza todo | `BITRIX_OUTBOUND_TOKEN` no coincide | Recopia el `appToken` real (paso 5) |
| Ollama timeout | n8n no ve a Ollama | Usa la IP/red interna correcta en `OLLAMA_URL` |
| `commercial plans` | Bitrix en plan gratuito | La REST de bots requiere plan de pago |

---

## Métodos REST que usa el workflow (n8n → Bitrix)
- `imbot.register` / `imbot.unregister` — alta/baja del bot (una vez).
- `imbot.message.add` — enviar la respuesta al chat.
- `imopenlines.bot.session.operator` — transferir la sesión a un asesor humano.
- `crm.duplicate.findbycomm` — detectar si el contacto ya existe.
- `crm.lead.add` — crear el lead de un prospecto nuevo.
- `crm.contact.update` — actualizar la ficha de un cliente existente.
