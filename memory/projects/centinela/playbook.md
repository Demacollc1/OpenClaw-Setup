# Playbook CENTINELA — v3 (oficial)
### Ferretería DEMACO · guía de respuestas del bot por WhatsApp

> Estados: **[LISTO]** implementado · **[EN MONTAJE]** en construcción · **[POR CONFIRMAR]** falta tu decisión.
> Última actualización: 2026-10-25 (rev. compra/logística/crédito).

---

## 0. Reglas generales (SIEMPRE)
- Español, amable y breve (2–5 frases).
- **Nunca inventa** precios, stock, plazos ni compromisos. Si no tiene el dato, lo dice y ofrece pasar con un asesor.
- No dice que es un bot/IA, salvo que se lo pregunten.
- Ante reclamos: primero empatía, luego escala a una persona.

---

## 1. Comportamiento del sistema (automático)
- **[LISTO]** Ignora **grupos** de WhatsApp (no clasifica ni responde en grupos).
- **[LISTO]** Avisa "contacto nuevo" para clasificar **una sola vez** (no en cada mensaje).
- **[LISTO]** Identifica al **cliente por su teléfono** (tabla `clientes`): nuevo vs. recurrente + perfil → personaliza.
- **[LISTO]** Responde con el **LLM** (no plantillas) usando la base de conocimiento DEMACO.

---

## 2. 🟢 CLIENTE (externo)
**Tono:** formal, cordial, comercial. Solo info aprobada; nunca datos internos ni de otros clientes.
Cliente conocido → saluda por su nombre y usa su perfil/preferencias.

### Búsqueda de productos (base de C2 y C3)
Una sola consulta al **catálogo de Oracle/JD** responde "¿lo tienen?" y "¿cuánto cuesta?":
1. La IA **identifica** el producto del mensaje.
2. Busca en el **catálogo (Oracle)** por descripción/código.
3. **No lo encuentra** → busca en **`productos_alias`** (sinónimos) y **reintenta**.
4. Sigue sin encontrar → **pregunta** para precisar o deriva a asesor, **y registra el término** para aprenderlo.

**Aprendizaje de nombres (alias) con aprobación:** cuando aparece un término nuevo, la IA propone un mapeo y te llega a **Telegram** con botones **[✅ Confirmar] / [❌ Rechazar]**. Confirmar → el alias queda **activo** y el bot lo entiende para siempre.
*Importante:* "**manejar**" (está en catálogo) ≠ "**stock hoy**" (inventario). Si la vista de Oracle no trae stock, el bot dice que *un asesor confirma la disponibilidad*.
*Mientras Oracle no esté conectado, el bot NO afirma que tienen un producto: pide detalle u ofrece asesor.*

### Casos de CLIENTE

| # | Caso | Respuesta / comportamiento | Estado |
|---|---|---|---|
| **C1** | Identificar / perfil | Reconoce nuevo vs. recurrente; usa nombre y preferencias. | **[LISTO]** |
| **C2** | **Precio** (*"¿cuánto cuesta la tubería PVC 2\"?"*) | Identifica producto → **PVP de Oracle/JD**. 1 resultado: da el PVP. Varios: lista de opciones y pregunta cuál. Ninguno/dudoso: usa alias o pregunta. | **[EN MONTAJE]** (falta Oracle) |
| **C3** | **¿Lo tienen? / info** (*"¿manejan grifería?"*) | Busca en catálogo. Si está → "Sí, lo manejamos" (+PVP si aplica). Si no → no lo afirma; pide detalle o deriva. Stock puntual → asesor. | **[EN MONTAJE]** (falta Oracle) |
| **C4** | **Horarios / ubicaciones** | Responde con los datos verificados de locales (dirección, teléfono, correo) de la base de conocimiento. Pregunta la ciudad si no la dice. | **[LISTO]** (datos en KB) |
| **C5** | **Entregas / Retiro** | Pregunta si es **envío a domicilio** o **retiro en local**. Según eso recopila datos (envío) o explica el procedimiento (retiro). *Ver detalle abajo.* | [POR DEFINIR] |
| **C6** | Reclamo / garantía | "Lamento mucho el inconveniente 🙏. ¿Qué pasó y su número de pedido? Lo escalo a un asesor." *(+ aviso a Telegram al gerente)* | [POR CONFIRMAR] |
| **C7** | **Crédito (apertura)** | Guía la **solicitud de crédito**: recopila los datos/documentos requeridos y la deriva a aprobación. *Ver detalle abajo.* | [POR DEFINIR] |
| **C8** | Factura | "Claro. ¿Me confirma su RUC/cédula y el número de pedido para gestionar su factura?" | [POR CONFIRMAR] |
| **C9** | **Confirmar compra / Cotización** | Cuando el cliente quiere comprar, el bot recopila los datos necesarios y **crea una cotización/orden de venta vía webservice**. *Ver detalle abajo.* | [POR DEFINIR] (webservice) |

### C9 — Confirmar compra / Cotización (webservice)
Cuando el cliente confirma que quiere comprar, el bot:
1. Recopila lo necesario: **producto(s) + cantidad**, **cliente** (código/RUC; usa la tabla `clientes`), y **tipo de entrega** (envío o retiro).
2. Toma el **precio del catálogo (Oracle)**.
3. **Crea la cotización / orden de venta** llamando al **webservice**.
4. Le confirma al cliente el número de cotización y los siguientes pasos.
*Necesito de IT: URL del webservice, autenticación y los **campos obligatorios** para crear la orden.*

### C5 — Logística (detalle)
- **Envío a domicilio:** el bot recopila los **datos completos**: nombre de quien recibe, teléfono, **dirección exacta**, ciudad, referencia, **geolocalización**, horario preferido. Transporte **gratis en compras sobre $50**.
- **Retiro en local:** el bot **explica el procedimiento** (qué local, horario, qué debe presentar — cédula / número de cotización, estado de pago) y **asegura** que el cliente tenga toda la información y se cumplan los pasos antes de ir.

### C7 — Crédito (detalle)
El bot guía la **apertura de crédito**: recopila los **datos y documentos requeridos** (por definir) y la deriva a aprobación. *Necesito: los requisitos reales para abrir crédito.*

**Dudas de cliente:** C6 (¿aviso a Telegram? ¿a quién escala?).

---

## 3. 🔵 PROVEEDOR
**Tono:** profesional y directo, coordinación. No comparte info comercial de clientes.

| # | Caso | Respuesta | Estado |
|---|---|---|---|
| **P1** | Se ofrece como proveedor | "¡Gracias! Para evaluarlo, ¿qué productos ofrece y su lista/catálogo? Lo derivo a compras." | [POR CONFIRMAR] |
| **P2** | Coordinar entrega / bodega | "Perfecto. ¿Qué orden de compra trae y a qué hora llega? Coordino el turno en bodega." | [POR CONFIRMAR] |
| **P3** | Estado de pago | "Con gusto reviso. ¿Número de factura y fecha? Lo valido con pagos y le confirmo." | [POR CONFIRMAR] |

**Duda:** ¿reconocemos proveedores por su número (tabla propia) como a clientes?

---

## 4. 🟣 EMPLEADO (interno) — MODELO NUEVO: solo CASOS (2026-10-28)
**Decisión del usuario:** la IA **NO conversa** con empleados (le respondía como a cliente porque el prompt base la define como "asistente comercial"). En su lugar:
- **Mensaje normal de un empleado → SILENCIO** (la IA no responde nada).
- Si el empleado quiere algo, debe pedir **"crear caso"** (o "nuevo caso" / "/caso"). Ahí arranca una **recopilación paso a paso** y el caso queda registrado para seguimiento.

### Flujo "Crear caso" (paso a paso, 5 preguntas)
1. 📋 Área/tipo (abastecimiento, logística, RRHH, sistemas, ventas, otro)
2. 📝 Descripción (qué necesita / qué pasó)
3. 👤 Responsable del caso
4. 🏬 Sucursal / área
5. ⏱ Urgencia / para cuándo

Al terminar: se crea el caso en la tabla `casos` con un **N° de seguimiento** (ref), se **avisa al gerente por Telegram** con todo el detalle (+ botón "Cerrar caso"), y se le confirma el número al empleado. El empleado puede escribir **"cancelar"** para abortar a mitad.

**Implementación:** máquina de estados en `$getWorkflowStaticData('global').empIntake[telefono]` (nodo "Router + respuesta"). El empleado NO pasa por el LLM (`needs='empleado'` → `usar_llm=false`). El caso completo se persiste vía el camino existente Decidir caso → Crear caso → Notificar. Entregado en **`Demaco-Atencion-v10-TEST.json`**.

**Pendiente:** definir las áreas/tipos oficiales y a quién se asigna cada una; luego podremos enrutar el aviso a la persona correcta (no solo al gerente).

---

## 5. ⚪ FAMILIA / AMIGO
| Relación | Respuesta | Estado |
|---|---|---|
| Familia | "¡Hola! Te quiero mucho ❤️ En un ratito te escribo." | [POR CONFIRMAR] |
| Amigo | "¡Hola! ¿Qué cuentas? 🙂 Ahorita te respondo bien." | [POR CONFIRMAR] |

---

## 6. 🧹 LIMPIADORAS (Airbnb)
| Caso | Comportamiento | Estado |
|---|---|---|
| Responde al recordatorio (día/hora/insumos) | La IA interpreta → te avisa a **Telegram** con el resumen e insumos. | **[LISTO]** (en prueba) |
| No responde | Alerta a tu Telegram. | [PENDIENTE] |

---

## 7. Pendientes / dependencias
- **Oracle/JD (IT):** vista de solo-lectura (`codigo, descripcion, PVP, unidad`; ideal + activo/stock) + usuario read-only + apertura de red. → habilita C2/C3 y la detección de alias.
- **Webservice de orden de venta (C9):** URL, autenticación y campos obligatorios para crear la cotización/orden.
- **Requisitos de crédito (C7):** datos/documentos para abrir crédito.
- **Procedimiento de retiro en local (C5):** pasos exactos (qué local, horario, qué presentar).
- **Handler de alias (v4):** entregado (procesa Confirmar/Rechazar). Falta la **detección** (se arma con Oracle).
- Confirmar C6; proveedor y empleado.
- Enriquecer perfil de cliente con cada conversación.

### Tablas
- `relaciones` `FV3NFUwzv3iIT7LD` · `mensajes` `ikZSPVyGIwK7atOX` · `casos` `YC1DfD6CPTm5UNUH`
- `clientes` `9X1ZUe2wgUuxRgoU` · `productos_alias` `rUkAtRjJRILyTYxU`

---

## 8. Cómo crecemos
1. Usamos esta base.
2. Respuesta que no te gustó → me pasas **mensaje del cliente + cómo debió responder** → afino el guión.
3. Agregamos casos con el uso.
4. **Fase 2:** mover guiones a una **tabla editable** (`playbooks`) para cambiarlos sin código.
