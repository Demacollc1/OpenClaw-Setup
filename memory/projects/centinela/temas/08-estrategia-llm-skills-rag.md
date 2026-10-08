# 08 · Estrategia LLM: "skills", RAG, entrenamiento

## ¿Qwen tiene skills como Claude?
**No nativamente.** Qwen en Ollama es un modelo "crudo" (texto→texto), sin marketplace de skills ni memoria ni herramientas propias. Pero ese comportamiento se **replica en la arquitectura (n8n)**:
1. **Instrucciones inyectadas** (system prompt / playbooks).
2. **Tool calling** — Qwen puede pedir "consulta precio / abre caso" y n8n lo resuelve con sub-flujos.

## Las 3 capas para dar "skills" a Centinela
1. **Playbooks** (Data Table `playbooks`): guión por `tipo_caso` + `audiencia`. Ver `07`.
2. **Router**: elige el playbook correcto y lo carga al prompt (como cargar una skill on-demand).
3. **RAG / memoria**: `qdrant` + `nomic-embed-text` (ya instalados) para dar conocimiento real (catálogo, políticas, precios) y evitar alucinaciones.

## Palancas por impacto/esfuerzo
1. Playbooks + system prompt por audiencia 🔥 (empezar aquí)
2. RAG con qdrant
3. Few-shot (2-3 ejemplos por playbook)
4. Salida estructurada JSON (ya en uso)
5. Tool calling a sub-flujos n8n
6. Memoria por contacto
7. Subir de modelo (`qwen3:14b/32b`) — solo si el servidor aguanta; última palanca
8. Bucle de evaluación (guardar respuestas malas → ajustar playbook)

## Facebook Ads → WhatsApp (atribución)
Discutido a alto nivel (CTWA / `ctwa_clid` / Conversions API). Requiere Meta directo. **Diferido.** Ver `09-meta-whatsapp-api.md` y `13`.
