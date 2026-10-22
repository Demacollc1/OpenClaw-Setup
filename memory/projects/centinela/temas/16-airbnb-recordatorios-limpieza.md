# 16 · Airbnb — recordatorios de limpieza (nueva aplicación)

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
1. **Townhouse WFH2 M2 Miami** — Yamika Medina — WA 13053600635 (US +1).
2. **Suit Vienna Ceibos** — Veronica Rodriguez — WA 593986675443.
3. **Salinas Alcazar** — Katty Tigrero — WA 593969612342.
(Los links iCal con token están embebidos en el nodo "Preparar recordatorios". Falta solo la API key de Wazzup en "Enviar (Wazzup)".)

## Pendiente / notas
- MVP con propiedades **inline**; migrar a Data Table `airbnb_propiedades` cuando crezca.
- ⚠️ **WhatsApp 24h:** avisos proactivos fuera de ventana requieren **plantilla aprobada** en Wazzup/Meta. Para pruebas: el limpiador manda "hola" primero. Para producción: registrar plantilla de utilidad.
- **Decisión del usuario (2026-10-22):** por ahora Opción 3 (WhatsApp tal cual + "hola"/"Listo" diario del limpiador para mantener la ventana de 24h). Intentará migrar al personal a **Telegram** (plan B, sin ventana). Si acepta → cambiar el canal del workflow a Telegram (5 min).
- Truco sugerido: pedir que respondan "Listo" a cada aviso → confirma la limpieza y reabre la ventana de 24h.
- Alternativa más simple/gratis para avisos proactivos: **Telegram**.
- Ideas futuras: instrucciones de entrada al huésped, aviso "ya está limpio", reporte diario al dueño.
