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

## Precios + catálogo (Oracle/JD) + alias de productos (2026-10-25)
- **Precios en vivo:** el bot dará el **PVP** consultando **Oracle (JD Edwards)**. Precios cambian varias veces al día → consulta en vivo. Nodo comunitario **`n8n-nodes-oracle-database` instalado**. Falta: **vista de solo-lectura** (codigo, descripcion, PVP, unidad; ideal + activo/stock) + **credencial Oracle (usuario solo-lectura)**. Seguridad: usuario read-only limitado a la vista.
- **"¿Lo tienen?" = misma consulta al catálogo** (existencia). "Manejar" (catálogo) ≠ "stock hoy" (inventario). Hasta conectar Oracle, el bot NO afirma que tienen un producto.
- **Alias de productos** (cliente llama distinto al producto): tabla **`productos_alias`** ID **`rUkAtRjJRILyTYxU`** (alias, termino_busqueda, codigo_producto, estado[activo/pendiente/rechazado], propuesto_por, fecha, notas). Flujo: catálogo no encuentra → busca alias → reintenta; si no, pregunta/deriva + registra término. El LLM resuelve sinónimos comunes; la tabla, los específicos.
- **Aprendizaje con aprobación humana:** términos nuevos → Telegram al gerente con botones **[Confirmar]/[Rechazar]** → confirma = alias activo.
  - **Handler ENTREGADO:** `Demaco-Clasificar-y-cerrar-v4-alias.json` = v3 + rama callback `al|ok|<alias>`/`al|no|<alias>` → If "Alias?" → update `productos_alias` estado activo/rechazado → confirma en Telegram. Superconjunto seguro de v3; activar desactivando v3 (mismo bot, 1 trigger). Bot casos = "mariainteligenteclawbot" cred `oq4WH3JQXyX8EsMp`, token 8758694075..., chat 7505702099.
  - **Falta (otra mitad):** detección en el flujo de atención (cuando la búsqueda en catálogo Oracle falla → insert pending alias + enviar botones). Depende de Oracle.
- Tabla `clientes` = `9X1ZUe2wgUuxRgoU`.

## Playbook completo v2 (2026-10-25)
Entregado `playbook-centinela-v2.md`: cliente/proveedor/empleado/familia-amigo/limpiadoras + comportamientos del sistema, con estados [LISTO]/[EN MONTAJE]/[POR CONFIRMAR]. Falta revisión del usuario de proveedor (P1-P3) y empleado (E1-E5), y dudas de cliente (reclamo→Telegram?, crédito, entregas).

## Borrador de playbooks (2026-10-24)
Entregado `playbooks-centinela-borrador.md`: casos comunes + respuestas modelo por relación (cliente/proveedor/empleado/familia-amigo), alineados a los tipos de caso del clasificador. Método acordado: usar base, corregir con casos reales, crecer con el uso; luego Fase 2 (tabla editable).
