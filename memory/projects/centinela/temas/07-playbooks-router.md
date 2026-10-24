# 07 · Playbooks + router por audiencia

Objetivo: que el LLM responda **distinto según a quién atiende** (cliente vs empleado vs proveedor) siguiendo guiones propios. Es el equivalente a "skills" en Qwen, orquestado por nosotros.

Estado: **Fase 1 entregada (2 nodos)**; pendiente confirmar nombres de campos del flujo y probar.

## Plan en 2 fases
- **Fase 1 (hoy):** playbooks embebidos en Code node + prompt por audiencia. Se prueba ya, sin tocar servidor.
- **Fase 2 (después):** migrar guiones a una Data Table `playbooks` para editarlos sin código.

## Nodos (van ANTES de enviar por Wazzup)
```
… clasificación (audiencia + tipo_caso)
   → [Nodo 1: Construir instrucciones]  (arma systemPrompt + userPrompt según playbook)
   → [Nodo 2: LLM generar respuesta]    (llama qwen3:8b, deja reply)
   → Enviar respuesta (Wazzup)          (ya existe, lee reply)
```

## Nodo 1 — lógica
- Lee `audiencia` (de `tipo_contacto`/`tipo`) y `tipo_caso` (con fallbacks).
- `BASE` (identidad), `PORAUDIENCIA{cliente,proveedor,empleado,otro}`, `PLAYBOOKS{cotizacion,cobranza,reclamo,soporte,consulta_interna,general}`.
- Devuelve `systemPrompt` + `userPrompt`.

## Cliente vs interno (resumen)
| | Cliente/externo | Empleado/interno |
|---|---|---|
| Tono | formal, comercial | directo, operativo |
| Info | solo aprobada | interna según rol |
| Riesgo | reputacional → conservador | fuga de info → control por rol |

## Integración real (confirmada al leer el flujo v6 LIVE)
**Hallazgo clave:** en el flujo `Demaco - Atencion WhatsApp v6 (LIVE)` el LLM **solo clasifica**; las respuestas al cliente son **plantillas fijas** armadas en los Code nodes `Router + respuesta` y `Decidir caso` (ej. "en un momento le contesto sobre su caso de X"). No hay un "LLM responder" que redacte.

Campos reales en el item de `Decidir caso`: `tipo` (= audiencia: cliente/empleado/proveedor/familia/amigo), `tipo_caso`, `nombre`, `empresa`, `mensaje`, `needs`, `estado_nuevo`, `hay_caso`, `reply`.

**Solución entregada (v7 test):** `Demaco-Atencion-WhatsApp-v7-PLAYBOOK-test.json` (inactivo, copia). Inserta 2 nodos entre `Decidir caso` y `Hay caso?`:
`Decidir caso → Construir instrucciones → LLM responder → Hay caso?`
y apunta `Enviar respuesta (Wazzup)` y `Responder` al `reply` del LLM (con fallback a la plantilla).

**Regla:** el LLM redacta SOLO si audiencia ∈ {cliente,empleado,proveedor}, sin `needs`, y `estado_nuevo` NO es confirmando_cierre/cerrado. En cierre, handoff, familia/amigo, o si el LLM falla → se mantiene la plantilla. Guiones adaptados a los tipos de caso reales.

Pendiente: prueba del usuario con su número. Luego Fase 2 (playbooks a Data Table).

> Regla de oro: 80% de la calidad viene de **playbooks + RAG**, no de cambiar el modelo.

## Perfil de cliente / CRM-lite (2026-10-24, en construcción)
Requerimiento del usuario al revisar playbooks: para CLIENTE, identificar por teléfono si es **nuevo o recurrente**, con **código de cliente** y **resumen de perfil** (preferencias, info).
- Fuentes reales: **JD Edwards (ERP)** + **Bitrix24**. Decisión: **tabla propia en n8n** como fuente del bot; sincronizar JDE/Bitrix después (si hay API accesible — JDE requiere AIS/REST vía IT; Bitrix tiene REST ya usado).
- **Tabla `clientes`** (a crear por el usuario): telefono (llave), codigo_cliente, nombre, empresa, estado (prospecto/cliente), resumen_perfil, preferencias, ultima_interaccion.
- Flujo a construir: cliente escribe → buscar en `clientes` por telefono → si existe, personalizar (nombre, recurrente, perfil) en el prompt del LLM; si no, crear prospecto con código auto. Enriquecer perfil con el uso (la IA puede actualizar resumen_perfil).
- Tabla `clientes` creada: ID **`9X1ZUe2wgUuxRgoU`** (proyecto EgGlivLJ3qfbKfL8). CSV de carga entregado.
- **v9 entregado** (`Demaco-Atencion-v9-Clientes-TEST.json`): agrega nodo "Buscar cliente" (get por telefono) + "Construir instrucciones" ahora inyecta el perfil (nombre/codigo/estado/resumen/preferencias) y personaliza; marca `crear_prospecto` si cliente no existe. A prueba.
- Pendiente siguiente: **auto-crear prospecto** (insert en `clientes` con código auto cuando `crear_prospecto`), y enriquecer perfil con el uso. Sync JDE/Bitrix más adelante.

## Borrador de playbooks (2026-10-24)
Entregado `playbooks-centinela-borrador.md`: casos comunes + respuestas modelo por relación (cliente/proveedor/empleado/familia-amigo), alineados a los tipos de caso del clasificador. Método acordado: usar base, corregir con casos reales, crecer con el uso; luego Fase 2 (tabla editable).
