# 01 · Arquitectura y recursos

## Stack
- **n8n** (self-hosted) en `https://n8n.demaco.ec` — orquestador de todos los flujos.
- **Ollama** (LLM local) en el servidor, accesible desde n8n vía `http://host.docker.internal:11434`.
- **n8n Data Tables** como base de datos (NO hay "Variables" Enterprise).
- **Docker Compose** (self-hosted-ai-starter-kit): contenedores `n8n`, `ollama`, `postgres`, `qdrant`.
- **Wazzup24** como pasarela de WhatsApp (BSP). → ver `02-wazzup-whatsapp.md`.
- **Telegram** como consola del gerente/operadores.

## Modelos Ollama instalados
- `qwen3:8b` — **el activo** (clasificación, intención, respuestas).
- `qwen2.5-coder:7b` — alterno, no usado en flujos.
- `nomic-embed-text` — embeddings para RAG (aún sin activar).

Llamadas a Ollama vía Code node: `this.helpers.httpRequest` a `/api/generate`, con `/no_think` y limpieza de `<think>`. Para decisiones estructuradas se usa `format:'json'`.

## IDs / referencias (NO secretos)
| Recurso | ID |
|---|---|
| Data Table `relaciones` | `FV3NFUwzv3iIT7LD` |
| Data Table `mensajes` | `ikZSPVyGIwK7atOX` |
| Data Table `casos` | `YC1DfD6CPTm5UNUH` |
| Proyecto n8n | `EgGlivLJ3qfbKfL8` |
| Credencial Ollama (n8n) | `GnbdLFr0Dol2JiMA` |
| Credencial Telegram (bot casos) | `oq4WH3JQXyX8EsMp` |
| Chat Telegram gerente | `7505702099` |
| Canal Wazzup activo | `bb4d4d3a-b215-4e8d-972b-3b4c9d9d6733` (núm. 593993066206) |
| Bitrix BOT_ID / CLIENT_ID | `116162` / `demaco_roberth_bot` |
| Meta Phone Number ID (prueba) | `107440008812599` |
| Meta WABA ID | `100192696215716` |

## Secretos (NO guardar valores aquí)
Tokens de Telegram, API key de Wazzup, webhook de Bitrix y token de WhatsApp viven en los nodos/credenciales de n8n. **Varios quedaron expuestos en chat → regenerar.** Ver `12-seguridad-pendientes.md`.

## Limitación actual
El usuario **no tiene acceso al servidor**. Todo se hace desde la UI web de n8n (crear Data Tables, pegar nodos, importar workflows). Por eso las keys se ponen inline en Code nodes en vez de `.env` (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` sería necesario para env en nodos).
