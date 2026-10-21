# 15 · Inventario de workflows en n8n

Lista real (captura del usuario, 2026-10-21).

| Workflow | Rol | Estado |
|---|---|---|
| **Demaco - Atencion WhatsApp v6 (LIVE)** | 🟢 **NÚCLEO**: webhook Wazzup `wa-inbound` → Normalizar → Router+respuesta → Decidir caso → Enviar (Wazzup). Recibir→clasificar→responder. | Publicado. **La base.** De aquí sale el v7. |
| **Demaco - Clasificar y cerrar (Telegram) v3** | Handler de **botones Telegram** (callback_query): clasificar contacto nuevo / cerrar caso. | Publicado. Compañero de v6. ⚠️ es el único trigger Telegram de ESE bot. |
| **Demaco - Auto-cierre de casos** | scheduleTrigger: cierra casos por inactividad. | Publicado. Compañero de v6. |
| **Centinela - Operador (Telegram → WhatsApp)** | Enviar WhatsApp desde Telegram (operadores). `/wa <num> <msg>`. | Publicado. (bot Telegram aparte). Ver `06`. |
| **Demaco MVP - Router + Agente Informacion (n8n+Ollama)** | Bot viejo de Bitrix. Obsoleto como canal. | Publicado pero obsoleto. Reciclar KB/router. Ver `13`, `14`. |
| **My workflow** | Desconocido (creado 12-jun). Probable prueba/borrador. | Por confirmar con el usuario. |

## Notas
- El **v7 PLAYBOOK (test)** generado aún NO está importado (no aparece en la lista).
- Al probar el v7, **desactivar v6** temporalmente para que no respondan ambos al webhook `wa-inbound`.
