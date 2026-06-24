# MVP (Fase 1) — Importar y probar

Workflow: [`../workflows/mvp-orquestador-info-n8n.json`](../workflows/mvp-orquestador-info-n8n.json)

Es **un solo workflow autocontenido** con **router de intención + agente Información + handoff**,
hecho **solo con nodos core** (habla con Ollama por HTTP; no necesita nodos LangChain ni
credenciales de n8n). Cuando agreguemos el agente #2 lo partimos en sub-workflows.

## 1. Importar
n8n → **Workflows → Import from File** → `mvp-orquestador-info-n8n.json`.

## 2. Variables (Settings → Variables, o env del servicio n8n)
| Variable | Ejemplo | Para |
|---|---|---|
| `BITRIX_WEBHOOK_URL` | `https://tucuenta.bitrix24.es/rest/1/xxxx` | REST de Bitrix24 (sin barra final) |
| `BITRIX_BOT_ID` | `123` | id del bot registrado |
| `BITRIX_OUTBOUND_TOKEN` | `application_token` | valida que el evento viene de tu Bitrix24 |
| `OLLAMA_URL` | `http://localhost:11434` | cómo n8n ve a Ollama (red interna del server) |
| `OLLAMA_MODEL` | `llama3.1` | modelo (debe estar `ollama pull`-eado) |

## 3. Activar y registrar el bot
- **Activa** el workflow (la Production URL del Webhook solo responde activo). Ruta: `demaco-bot`.
- Registra el bot con `imbot.register` apuntando `EVENT_MESSAGE_ADD` a esa Production URL y
  conéctalo a tu Canal Abierto (ver [`../setup/register-imbot.md`](../setup/register-imbot.md)).

## 4. Flujo interno
```
Webhook → Parsear → Validar token → CRM identificar contacto
   → Clasificar (Ollama, JSON) → Leer intención → Ruta por categoría
        ├─ info       → Agente Información (Ollama + memoria) ─┐
        ├─ handoff    → mensaje "te paso un asesor" ──────────┤→ ¿Handoff? → Enviar respuesta
        └─ pendiente  → cortesía por especialista no listo ───┘            (+ Transferir si aplica) → 200 OK
```
- **info** atiende `INFO_POLITICAS_STOCK` y `OTRO` (saludos/ambiguo).
- **pendiente** cubre `VENTAS_COTIZACION`, `POSVENTA_PEDIDOS`, `COMPRAS_BODEGA`,
  `MARKETING_CAMPANAS` → responde con cortesía y **transfiere a un asesor** (no deja al cliente
  sin salida hasta que construyamos esos agentes).
- **handoff** = el cliente pidió "Operador".

## 5. Criterios de aceptación
1. "¿a qué hora abren?" → responde horarios/locales (sin transferir).
2. "quiero cotizar 10 sacos de cemento" → cortesía + **transferencia** a asesor.
3. "Operador" → **transferencia** inmediata.
4. Dos mensajes seguidos en el mismo chat mantienen contexto (memoria por `DIALOG_ID`).

## 6. Notas
- **Memoria**: `static data` por `DIALOG_ID` (suficiente para 1 instancia). Para alta
  concurrencia migrar a Postgres/Redis (ver diseño §5).
- **Base de conocimiento**: va embebida en el prompt del nodo *Preparar Info*. Edita ahí
  locales/horarios/políticas. En Fase 1.1 se migra a un vector store.
- **Transferencia**: `imopenlines.bot.session.operator` usa `CHAT_ID`; el workflow usa el del
  evento y, si no viene, el `DIALOG_ID`. Ajusta según tu Open Line.
