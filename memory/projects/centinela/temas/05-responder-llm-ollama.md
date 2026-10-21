# 05 · Responder con LLM (Ollama)

Estado: **funcionando** (recibe → entiende → responde → envía por Wazzup).

> ⚠️ Matiz importante (confirmado en v6 LIVE): hoy el LLM **solo clasifica** (rol y tipo de caso). Las respuestas al cliente son **plantillas fijas** (acuse: "en un momento le contesto…"). La redacción real por LLM se agrega con los playbooks (v7). Ver `07-playbooks-router.md`.

## Modelo y conexión
- `qwen3:8b` en Ollama, vía `http://host.docker.internal:11434`.
- Importante: el modelo debe existir en el contenedor correcto. Hubo un 404 porque `qwen3:8b` no estaba en el contenedor `ollama:11434` (tenía `llama3.2`); se resolvió usando la **base URL real de la credencial** `host.docker.internal:11434`.

## Llamada (Code node)
```js
const resp = await this.helpers.httpRequest({
  method:'POST',
  url:'http://host.docker.internal:11434/api/generate',
  body:{ model:'qwen3:8b', stream:false, system, prompt:'/no_think\n'+userPrompt,
         options:{ temperature:0.3 } },
  json:true, timeout:60000
});
let reply = (resp.response||'').replace(/<think>[\s\S]*?<\/think>/gi,'').trim();
```

## Gotchas resueltos
- `/no_think` al inicio + limpiar `<think>…</think>` (qwen3 tiene modo razonamiento).
- Para decisiones (clasificar) usar `format:'json'` y `={{ JSON.stringify($json) }}` bien formado (evitar typos `=={{}}`).
- Respuestas vacías para contactos sin caso: se corrigió con flag `hay_caso` y operador `boolean/true` en el If (el operador string `notEmpty` fallaba).

## Mejora en curso
Antes de responder, inyectar el **playbook por audiencia** (ver `07-playbooks-router.md`).
