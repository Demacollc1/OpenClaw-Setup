# CENTINELA — Índice de contexto

> Punto de entrada para recuperar contexto del proyecto Centinela.
> **Leer primero `centinela.md`** (estado actual y funciones). Luego entrar al tema que haga falta.

## 📄 Documento maestro
- [`centinela.md`](centinela.md) — **documento vivo**: qué es, arquitectura, estado de funciones, próximas acciones, changelog. *Mantener actualizado.*

## 📚 Temas (detalle)
| # | Tema | Archivo | Para qué sirve |
|---|------|---------|----------------|
| 01 | Arquitectura y recursos | [temas/01-arquitectura-y-recursos.md](temas/01-arquitectura-y-recursos.md) | Stack, modelos Ollama, IDs/credenciales (no secretos), limitaciones |
| 02 | Wazzup (WhatsApp) | [temas/02-wazzup-whatsapp.md](temas/02-wazzup-whatsapp.md) | Recibir/enviar WhatsApp, payload, filtro de eco, canal |
| 03 | Clasificación de contactos | [temas/03-clasificacion-contactos.md](temas/03-clasificacion-contactos.md) | Roles, multi-rol/multi-empresa, empresas del grupo |
| 04 | Gestión de casos | [temas/04-gestion-casos.md](temas/04-gestion-casos.md) | Agrupar hilos, tipos, cierres (auto/manual), gotcha Telegram |
| 05 | Responder con LLM (Ollama) | [temas/05-responder-llm-ollama.md](temas/05-responder-llm-ollama.md) | Llamada a qwen3:8b, gotchas resueltos |
| 06 | Bot operador Telegram→WA | [temas/06-bot-operador-telegram.md](temas/06-bot-operador-telegram.md) | Enviar WhatsApp desde Telegram, allowlist, comando /wa |
| 07 | Playbooks + router | [temas/07-playbooks-router.md](temas/07-playbooks-router.md) | Respuestas por audiencia, 2 fases, bloqueador actual |
| 08 | Estrategia LLM: skills/RAG | [temas/08-estrategia-llm-skills-rag.md](temas/08-estrategia-llm-skills-rag.md) | ¿Qwen tiene skills?, RAG, palancas de mejora |
| 09 | Meta WhatsApp Cloud API | [temas/09-meta-whatsapp-api.md](temas/09-meta-whatsapp-api.md) | Requisitos, precios, número nuevo (en pausa) |
| 10 | Pitch comercial | [temas/10-pitch-comercial.md](temas/10-pitch-comercial.md) | Deck HTML + documento, URL del artefacto |
| 11 | Bitrix24 (histórico) | [temas/11-bitrix24.md](temas/11-bitrix24.md) | Integración abandonada, por qué |
| 12 | Seguridad (pendiente) | [temas/12-seguridad-pendientes.md](temas/12-seguridad-pendientes.md) | Tokens a regenerar, mover a .env |
| 13 | MVP Bitrix (Router + KB) | [temas/13-mvp-bitrix-router-kb.md](temas/13-mvp-bitrix-router-kb.md) | Workflow viejo con activos reutilizables (router, memoria, handoff) |
| 14 | Base de conocimiento DEMACO | [temas/14-base-conocimiento-demaco.md](temas/14-base-conocimiento-demaco.md) | Locales, horarios, teléfonos, políticas — para playbooks/RAG |
| 15 | Inventario de workflows | [temas/15-inventario-workflows.md](temas/15-inventario-workflows.md) | Qué hace cada flujo en n8n y cuál es la base |
| 16 | Airbnb: recordatorios limpieza | [temas/16-airbnb-recordatorios-limpieza.md](temas/16-airbnb-recordatorios-limpieza.md) | Centinela reutilizado: avisos al personal por iCal + WhatsApp |

## 🔎 Cómo usar este índice
1. ¿Pregunta general o estado? → `centinela.md`.
2. ¿Tema específico (ej. "cómo envía por Wazzup")? → entrar al tema de la tabla.
3. ¿IDs, credenciales, canales? → tema 01.
4. Tras cambiar/agregar una función → actualizar `centinela.md` (estado + changelog) y el tema correspondiente.

---

*Creado: 2026-10-08*
