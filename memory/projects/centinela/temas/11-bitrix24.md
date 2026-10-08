# 11 · Bitrix24 (histórico — deprioritizado)

Estado: **abandonado.** Se decidió dejar de usar Bitrix y conectar n8n directo a base de datos propia (Data Tables) + Wazzup.

## Lo que se hizo
- Conectar Bitrix24 Cloud a n8n propio (`n8n.demaco.ec`, sin puertos).
- Guía: `integrations/bitrix24-n8n-ollama/setup/conectar-bitrix-cloud-con-n8n-propio.md` (commit temprano `f8ab40e..7eda8b0` en rama `claude/bitrix24-n8n-ollama-hhxkh1`).
- `imbot.register`: requirió `CLIENT_ID:"demaco_roberth_bot"` → éxito BOT_ID `116162`.
- `imbot.message.add` para responder.

## Gotcha
`imbot.register` daba `ACCESS_DENIED Client ID not specified` hasta especificar CLIENT_ID.

## Por qué se dejó
Se migró a arquitectura propia (n8n + Data Tables + Wazzup) sin depender de Bitrix.
