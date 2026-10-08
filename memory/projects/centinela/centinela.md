# CENTINELA — Documento vivo del sistema

> Documento maestro del proyecto. **Actualizar cada vez que agreguemos o cambiemos una función.**
> Nombre "CENTINELA" = provisional (marca a definir).

## Qué es
Un **número gerencial corporativo con IA** que, sobre WhatsApp / correo / Telegram:
**organiza** cada conversación en casos · **delega** al responsable · **audita** el cumplimiento.
Idea central: *un solo número y correo hacia afuera; un equipo ordenado hacia adentro.*

## Dueño
Roberth (demacollc@gmail.com). Grupo multi-empresa (Demaco, Alivio, GPS-ecuador/Seeworld, Macotrans, Servigomez, Construbonanza, Certifsa).

## Arquitectura (resumen)
n8n (`n8n.demaco.ec`) + Ollama local (`qwen3:8b`) + n8n Data Tables + Wazzup (WhatsApp) + Telegram (gerente/operadores) + qdrant (RAG, pendiente). Detalle: `temas/01-arquitectura-y-recursos.md`.

---

## Estado de funciones

### ✅ En vivo
- Recibir WhatsApp por Wazzup → responder con LLM → enviar de vuelta. (`temas/02`, `05`)
- Clasificar contacto (cliente/empleado/proveedor/amigo/familia/otro), multi-rol/multi-empresa. (`temas/03`)
- Gestión de casos: agrupar hilos, clasificar tipo, cierre inteligente + manual (Telegram) + auto por inactividad. (`temas/04`)
- Registro de mensajes y casos en Data Tables.
- Notificación de nuevo caso al gerente por Telegram.

### 🚧 En curso
- **Playbooks + router por audiencia** (Fase 1 entregada; falta confirmar nombres de campos y probar). (`temas/07`)
- **Bot operador Telegram → WhatsApp** (workflow entregado; falta confirmar prueba). (`temas/06`)

### ⏸️ Pendiente / diferido
- RAG con qdrant + nomic-embed-text (conocimiento real). (`temas/08`)
- Agrupación de proveedores (lógica A–D).
- Modo asistente en Telegram (menú 1/2/3); "modo conversación" del bot operador.
- Meta WhatsApp Cloud API (número nuevo) — en pausa, falta número libre. (`temas/09`)
- Atribución Facebook Ads → WhatsApp (CTWA). (`temas/08`)
- **Seguridad:** regenerar tokens expuestos + mover a `.env`. (`temas/12`)

### 💼 Comercial
- Deck de ventas (18 slides) + documento comercial. (`temas/10`)

---

## Próximas acciones
1. Cerrar **playbooks** (pedir captura del output del nodo clasificador para ver nombres de campos).
2. Confirmar prueba del **bot operador**.
3. Luego: RAG / proveedores / seguridad.

---

## Changelog
- **2026-10-08** — Creada la base de memoria del proyecto (índice + temas + este doc). Bot operador y playbooks Fase 1 entregados y a la espera de pruebas.
- *(histórico previo documentado en los archivos de `temas/`)*

---

*Última actualización: 2026-10-08*
