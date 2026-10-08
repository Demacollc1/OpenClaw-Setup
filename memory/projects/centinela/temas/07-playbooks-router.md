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

## BLOQUEADOR actual
Falta confirmar **con qué nombre llegan** `audiencia` y `tipo_caso` al llegar al Nodo 1. Pedir al usuario captura del output del nodo clasificador para ajustar las 2 líneas marcadas.

> Regla de oro: 80% de la calidad viene de **playbooks + RAG**, no de cambiar el modelo.
