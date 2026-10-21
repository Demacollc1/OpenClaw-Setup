# 13 · MVP Bitrix (Router + Agente Información) — activos reutilizables

Workflow: **"Demaco MVP - Router + Agente Informacion (n8n + Ollama)"** (id `c0UVNtcEYORY1200`).
Estado: **obsoleto como canal** (atado a Bitrix24, abandonado), pero su "cerebro" es reutilizable.

## Qué hace
Webhook imbot Bitrix → parsear → validar (token/no-bot) → CRM identificar contacto → **Router de intención (Ollama)** → Switch (info/handoff/pendiente) → Agente de Información / derivar a asesor → responder por `imbot.message.add` → (handoff) transferir a operador.

- Lee claves desde **`$env`** (BITRIX_OUTBOUND_TOKEN, BITRIX_WEBHOOK_URL, BITRIX_BOT_ID, OLLAMA_URL, OLLAMA_MODEL=llama3.1). ✅ buena práctica (sin secretos en el archivo).

## 💎 Activos reutilizables (portar a Centinela/playbooks)
1. **Base de conocimiento DEMACO** (embebida en "Preparar Info") → ver `14-base-conocimiento-demaco.md`.
2. **Router de intención** con categorías: VENTAS_COTIZACION, POSVENTA_PEDIDOS, INFO_POLITICAS_STOCK, COMPRAS_BODEGA, MARKETING_CAMPANAS, HUMANO, OTRO.
3. **Memoria de conversación**: guarda últimos 12 turnos por `dialogId` con `$getWorkflowStaticData('global')`.
4. **Handoff a humano**: respuesta + `imopenlines.bot.session.operator` (transferir a asesor).
5. Persona del agente: **"Roberth", asistente comercial digital de DEMACO**.

## Plan sugerido
Meter la **base de conocimiento** en el agente de playbooks **v7** (para respuestas con datos reales), y luego migrar a **RAG con qdrant** cuando crezca. El router de intención se puede fusionar con la clasificación de casos actual.
