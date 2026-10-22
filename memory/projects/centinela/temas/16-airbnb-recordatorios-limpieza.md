# 16 · Airbnb — recordatorios de limpieza (nueva aplicación)

Demuestra que **Centinela es una plataforma reutilizable** (n8n + IA + mensajería + datos), no un solo bot. Caso: avisar al personal de limpieza las salidas/entradas de varios Airbnb.

## Decisiones del usuario
- **Fuente de fechas:** Airbnb **iCal** (cada anuncio exporta un `.ics`).
- **Canal:** WhatsApp (Wazzup).

## Workflow entregado
`Airbnb-Recordatorios-Limpieza.json` (inactivo). 3 nodos:
`scheduleTrigger (18:00 diario) → Preparar recordatorios → Enviar (Wazzup)`.

- **Preparar recordatorios:** lee lista inline `PROPIEDADES` [{nombre, ical_url, telefono}], hace GET al iCal, parsea VEVENT (DTSTART=check-in, DTEND=check-out), y si hay **check-out MAÑANA** arma el aviso (avisa si también hay check-in el mismo día = turnover prioritario). Zona Ecuador (UTC-5).
- **Enviar (Wazzup):** POST `/v3/message` a cada limpiador. KEY desde `$env` / placeholder; canal `bb4d4d3a-...`.

## Pendiente / notas
- MVP con propiedades **inline**; migrar a Data Table `airbnb_propiedades` cuando crezca.
- ⚠️ **WhatsApp 24h:** avisos proactivos fuera de ventana requieren **plantilla aprobada** en Wazzup/Meta. Para pruebas: el limpiador manda "hola" primero. Para producción: registrar plantilla de utilidad.
- Alternativa más simple/gratis para avisos proactivos: **Telegram**.
- Ideas futuras: instrucciones de entrada al huésped, aviso "ya está limpio", reporte diario al dueño.
