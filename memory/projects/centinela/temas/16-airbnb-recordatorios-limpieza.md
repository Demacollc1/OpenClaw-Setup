# 16 · Airbnb — recordatorios de limpieza (nueva aplicación)

> ✅ **PROBADO Y FUNCIONANDO (2026-10-22):** el aviso le llegó a Yamika por WhatsApp. Falta activar el flujo (toggle ON) tras restaurar la fecha normal, y verificar los números de Verónica y Katty cuando escriban.

Demuestra que **Centinela es una plataforma reutilizable** (n8n + IA + mensajería + datos), no un solo bot. Caso: avisar al personal de limpieza las salidas/entradas de varios Airbnb.

## Decisiones del usuario
- **Fuente de fechas:** Airbnb **iCal** (cada anuncio exporta un `.ics`).
- **Canal:** WhatsApp (Wazzup).

## Workflow entregado
`Airbnb-Recordatorios-Limpieza.json` (inactivo). 3 nodos:
`scheduleTrigger (18:00 diario) → Preparar recordatorios → Enviar (Wazzup)`.

- **Preparar recordatorios:** lee lista inline `PROPIEDADES` [{nombre, ical_url, telefono, limpiador}], hace GET al iCal, parsea VEVENT (DTSTART=check-in, DTEND=check-out), y si hay **check-out MAÑANA** arma el aviso. Zona Ecuador (UTC-5). **El mensaje indica la ventana de limpieza:** calcula la **próxima entrada** (menor check-in ≥ fecha de salida) → si es el mismo día = URGENTE antes de 15:00; si es posterior = "limpia entre [salida] y [próxima entrada]"; si no hay = "unidad libre, con calma". Saluda al limpiador por su nombre.
- **Enviar (Wazzup):** POST `/v3/message` a cada limpiador. KEY desde `$env` / placeholder; canal `bb4d4d3a-...`.

## Propiedades configuradas (3) — 2026-10-22
Workflow pre-cargado con las 3 (links iCal reales validados, saludo por nombre):
1. **Townhouse WFH2 M2 Miami** — Yamika Medina — WA **13053600685** (US +1). ⚠️ OJO: el usuario dio 13053600635 pero el real (visto en Wazzup) es 13053600685. Corregido 2026-10-22.
2. **Suit Vienna Ceibos** — Veronica Rodriguez — WA 593986675443.
3. **Salinas Alcazar** — Katty Tigrero — WA 593969612342.
(Los links iCal con token están embebidos en el nodo "Preparar recordatorios". Falta solo la API key de Wazzup en "Enviar (Wazzup)".)

## Giro: limpiadoras en WhatsApp (NO tienen Telegram) — 2026-10-23
Las limpiadoras no usan Telegram → se descarta el bot de limpieza para ellas. **Hallazgo importante:** el canal Wazzup es WhatsApp **por QR** (transport `whatsapp`), que **NO tiene ventana de 24h ni plantillas** → los recordatorios proactivos por WhatsApp SÍ funcionan a cualquiera (el fallo anterior fue el typo de número, no la ventana). Las **alertas al gerente** sí van por Telegram (chat 7505702099, bot casos).

Implementación entregada (en prueba):
- **`preparar-recordatorios-v2.js`**: el recordatorio ahora pregunta día/hora + insumos.
- **`Demaco-Atencion-v6-mas-Limpieza-TEST.json`**: copia de v6 con un bloque en "Router + respuesta" que detecta los números de las limpiadoras (Yamika 13053600685, Veronica 593986675443, Katty 593969612342) → interpreta la respuesta con qwen3:8b (día/hora/insumos JSON) → envía resumen al gerente por Telegram → responde "Gracias, anotado" a la limpiadora. No pasa por el flujo normal ni genera alerta de "contacto nuevo".
- Pendiente: **punto 4** (alerta a Telegram si una limpiadora NO responde) — requiere tracking + chequeo programado.
- **Consolidado v8 (2026-10-23):** `Demaco-Atencion-v8-CONSOLIDADO-TEST.json` = v6 + limpiadoras + playbooks(KB) + fix "alerta una sola vez". Reemplaza v7 y v6+limpieza. Arregla 2 quejas del usuario: (1) antes pedía clasificar en CADA mensaje → ahora alerta 1 sola vez por número nuevo (usa `$getWorkflowStaticData` → `st.vistos`); (2) antes repetía plantilla fija → ahora el LLM redacta real con KB DEMACO. A prueba del usuario; si pasa, se vuelve el flujo principal (desactivar v6).

## Lección (debug)
- Wazzup devuelve **ok/2xx aunque el número sea erróneo** → el mensaje se va a un chat distinto/vacío y NO aparece en el diálogo correcto. Verificar que el `telefono` (chatId) coincida EXACTO con el número que Wazzup muestra en el chat del contacto. (Caso Yamika: typo …0635 vs …0685.)
- Diagnóstico útil: GET `https://api.wazzup24.com/v3/channels` (con Bearer key) para ver canales/estado; `returnFullResponse:true` en el POST para ver messageId/error real.

## Evolución: confirmación + insumos por Telegram (en construcción, 2026-10-22)
Requerimiento ampliado: el recordatorio debe preguntar al limpiador **qué día/hora irá** y **si necesita insumos**; la IA interpreta la respuesta y **avisa al gerente por Telegram** (con los insumos); y si el limpiador **no responde**, alerta al gerente. → Se decidió mover la interacción con limpiadores a **Telegram** (WhatsApp choca con el webhook del v6 y la ventana de 24h).
- **Bot de limpieza creado:** @Limpiezairbnbot (t.me/Limpiezairbnbot). Token en credencial n8n "Telegram - Bot Limpieza" (NO se guarda aquí por seguridad).
- **Paso 1 entregado:** `Limpieza-Registro-de-limpiadores.json` — captura chat_id + nombre cuando el limpiador escribe al bot. Pendiente: obtener los 3 chat IDs y mapearlos a cada propiedad.
- 🚨 **BLOQUEADOR (2026-10-22): el certificado SSL de `n8n.demaco.ec` está VENCIDO.** Telegram rechaza los webhooks ("certificate verify failed") → NINGÚN bot de Telegram recibe mensajes (registro, casos, operador). Wazzup lo tolera por ahora (WhatsApp sigue). Diagnóstico confirmado con getWebhookInfo (SSL error, pending_updates) y SSL Labs (expired). **Fix: renovar el cert en el servidor (certbot renew + reload; servir fullchain). El usuario NO tiene acceso al servidor** → debe pasarlo a quien lo administra. Hasta que se renueve, el flujo de limpieza por Telegram queda en pausa.
- Mapeo propiedad↔limpiador: Townhouse→Yamika, Vienna→Veronica, Salinas→Katty.
- Próximo: flujo recordatorio (pregunta día/hora/insumos) + handler que interpreta con qwen3:8b + notifica al gerente (chat 7505702099) + chequeo de no-confirmación.

## Pendiente / notas
- MVP con propiedades **inline**; migrar a Data Table `airbnb_propiedades` cuando crezca.
- ⚠️ **WhatsApp 24h:** avisos proactivos fuera de ventana requieren **plantilla aprobada** en Wazzup/Meta. Para pruebas: el limpiador manda "hola" primero. Para producción: registrar plantilla de utilidad.
- **Decisión del usuario (2026-10-22):** por ahora Opción 3 (WhatsApp tal cual + "hola"/"Listo" diario del limpiador para mantener la ventana de 24h). Intentará migrar al personal a **Telegram** (plan B, sin ventana). Si acepta → cambiar el canal del workflow a Telegram (5 min).
- Truco sugerido: pedir que respondan "Listo" a cada aviso → confirma la limpieza y reabre la ventana de 24h.
- Alternativa más simple/gratis para avisos proactivos: **Telegram**.
- Ideas futuras: instrucciones de entrada al huésped, aviso "ya está limpio", reporte diario al dueño.
