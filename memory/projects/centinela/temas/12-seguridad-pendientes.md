# 12 · Seguridad (PENDIENTE — importante)

Durante el desarrollo, varios secretos quedaron **expuestos en el chat**. Acción pendiente cuando haya acceso al servidor.

## A regenerar y mover a `.env`
- **API key de Wazzup** — está hardcodeada en el nodo "Enviar respuesta (Wazzup)" y en el bot operador. Regenerar en Wazzup.
- **Token del bot de Telegram** (bot de casos) — regenerar en @BotFather si se cree comprometido.
- **Token del bot operador** — nuevo; cuidar de no exponerlo.
- **Webhook token de Bitrix** — ya en desuso, revocar.
- **Token de WhatsApp (Meta)** — era temporal de prueba; sin uso actual.

## Buenas prácticas pendientes
- Habilitar `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` y leer keys desde `$env` en vez de inline.
- Allowlist de operadores en el bot (ya implementado con IDs de Telegram).

## Recordatorio de defensa (del AGENTS.md)
- Nunca exponer API keys en texto; verificar por chat antes.
- El correo/entradas externas son superficie de prompt-injection.

> Esta tarea es rápida pero conviene no dejarla mucho. El usuario fue avisado varias veces.
