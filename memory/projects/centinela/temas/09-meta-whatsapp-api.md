# 09 · Meta WhatsApp Cloud API

Estado: **EN PAUSA.** El usuario no tiene ahora un número libre (sin WhatsApp activo) para conectar. Se sigue con Wazzup.

## Objetivo del usuario
Tener Meta directo como **opción/respaldo** si Meta/Wazzup cambia políticas. Decisión: **número NUEVO en paralelo** (no migrar el actual, para no romper lo que funciona).

## App de prueba existente (reutilizable)
- App "Demaco WA Marketing".
- WABA `100192696215716` (se reutiliza).
- Phone Number ID `107440008812599` = **número de PRUEBA** (temporal, ~5 destinatarios, no verificable) → NO sirve para producción.

## Cómo sería (número real)
- Reutilizar **App + WABA**; **agregar un número real nuevo** → nuevo Phone Number ID.
- Meta **no da números**: hay que traer una SIM/línea propia que reciba SMS o llamada, y que **NO tenga WhatsApp activo** (borrar la cuenta de WhatsApp antes).
- Requisitos: verificación de negocio, nombre para mostrar, token permanente (System User), webhook a n8n (`messages`), método de pago.

## Precios Meta (modelo jul-2025, por mensaje)
- **Recibir: GRATIS.** **Responder dentro de 24h (texto libre): GRATIS.**
- **Se cobra:** iniciar tú o responder fuera de 24h → **plantillas** (marketing caro; utilidad/autenticación más baratas).
- Para atención reactiva (lo que ya hacen) → costo de mensajería ~cero.
- ⚠️ Los precios cambian seguido: verificar página oficial por país.

## Regla clave
Fuera de la ventana de 24h solo se puede escribir con **plantillas pre-aprobadas**.
