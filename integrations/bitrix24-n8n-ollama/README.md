# Bitrix24 → n8n → Ollama · Bot de prospectos (Demaco / RoberthV2)

Reconstrucción en **n8n + Ollama** del chatbot de Bitrix24 "RoberthV2" de Demaco, que
hoy corre sobre un constructor visual con OpenAI. n8n pasa a orquestar todo: recibe los
chats de **Canales Abiertos (Open Lines)**, identifica si el prospecto es **cliente nuevo
o existente**, conversa con **Ollama (`llama3.1`)**, crea/actualiza Lead y Contacto en el
CRM y transfiere a un asesor cuando corresponde.

> **Por qué este diseño:** el bot original es *conversacional con estado* (las "misiones"
> recogen datos a lo largo de varios mensajes). En n8n eso se resuelve con un agente con
> **memoria por conversación** (clave `DIALOG_ID`) en lugar de replicar nodo por nodo el
> constructor. La identificación nuevo/existente se hace consultando el CRM
> (`crm.duplicate.findbycomm`), igual que el nodo condicional `check_entity` original.
>
> **Por qué no se "apunta" el bot actual a Ollama:** el constructor usa la **OpenAI
> Assistants API** (`asst_...`), que **Ollama no implementa** (Ollama solo expone la API
> de *chat* compatible con OpenAI). Por eso se reconstruye la lógica en n8n.

## Dos variantes del mismo bot

Hay **dos workflows** que replican el flujo de RoberthV2; elige según cómo quieras operar el CRM:

| | **A. Determinista (HTTP)** | **B. AI Agent + herramientas** |
|---|---|---|
| Archivo | `demaco-bot-ollama-n8n.json` | `demaco-bot-agent-tools-n8n.json` |
| Cómo conversa | Nodo HTTP a `Ollama /api/chat`, respuesta en JSON | Nodo **AI Agent** de n8n con modelo Ollama |
| Cómo toca el CRM | Nodos HTTP fijos + `Switch` por acción | El agente llama **herramientas** (*HTTP Request Tool*) y decide |
| Memoria | `static data` por `DIALOG_ID` | Nodo *Window Buffer Memory* por `DIALOG_ID` |
| Cuándo usarla | Flujo predecible, fácil de auditar | Más flexible/“agéntico”; el modelo orquesta las acciones |

> La variante **B** es un **AI Agent** (Ollama `llama3.1`) con cuatro herramientas nativas de
> n8n (`crm_find_contact`, `crm_create_lead`, `crm_update_contact`, `openlines_transfer`),
> cada una un nodo *HTTP Request Tool* que pega al REST de Bitrix24. El agente decide cuándo
> usarlas. No requiere instalar nodos de comunidad ni un servidor externo.
>
> **Sobre MCP:** el endpoint oficial `mcp-dev.bitrix24.com/mcp` es un MCP de **documentación**
> de la API (búsqueda/consulta de métodos REST), no opera el CRM, así que no sirve como
> herramienta del bot. Sí es útil como asistente de desarrollo. Las llamadas REST de esta
> integración (`crm.duplicate.findbycomm`, `crm.lead.add`, `crm.contact.update`,
> `imopenlines.bot.session.operator`) fueron verificadas contra esa documentación oficial.

## Contenido

```
integrations/bitrix24-n8n-ollama/
├── README.md                              # Esta guía
├── .env.example                           # Variables necesarias (Bitrix24 + Ollama)
├── workflows/
│   ├── demaco-bot-ollama-n8n.json         # Variante A: determinista (HTTP)
│   └── demaco-bot-agent-tools-n8n.json    # Variante B: AI Agent + herramientas nativas
├── prompts/
│   └── system-prompt-demaco.md            # El prompt de Roberth (documentado)
└── setup/
    └── register-imbot.md                  # Registro único del chatbot en Bitrix24
```

## Arquitectura (flujo de un mensaje)

```
Cliente (WhatsApp/Web) → Bitrix24 Open Lines → [evento imbot] → Webhook n8n
   → Validar token → Buscar contacto en CRM (¿nuevo o existente?)
   → Construir prompt + cargar memoria de la conversación
   → Ollama llama3.1 (responde en JSON: respuesta + acción + datos)
   → Enviar respuesta al chat (imbot.message.add)
   → Acción CRM:  crear_lead │ actualizar_ficha │ transferir │ (responder)
```

## Requisitos previos
- **n8n** accesible públicamente por **HTTPS** (Bitrix24 Cloud debe poder entregar los
  eventos del bot a la URL del webhook).
- **Ollama** corriendo y con el modelo descargado: `ollama pull llama3.1`.
  - Si n8n y Ollama están en hosts distintos, arranca Ollama con
    `OLLAMA_HOST=0.0.0.0:11434` y abre el puerto.
- **Bitrix24 Cloud** con permisos de administrador para crear un webhook entrante y
  conectar el bot a los Canales Abiertos.

## Instalación paso a paso

### 1) Webhook entrante en Bitrix24
En Bitrix24: **Aplicaciones → Desarrollador → Otro → Webhook entrante**. Marca los
permisos **`imbot`, `im`, `imopenlines`, `crm`** y guarda. Copia la URL base, por
ejemplo `https://tucuenta.bitrix24.es/rest/1/xxxxxxxxxxxxxxxx`.

### 2) Importar el workflow en n8n
- n8n → **Workflows → Import from File** → `workflows/demaco-bot-ollama-n8n.json`.
- En **Settings → Variables** (o variables de entorno del servicio n8n) define las del
  archivo [`.env.example`](./.env.example): `BITRIX_WEBHOOK_URL`, `BITRIX_BOT_ID`,
  `BITRIX_OUTBOUND_TOKEN`, `OLLAMA_URL`, `OLLAMA_MODEL` (y opcional `BITRIX_OPERATOR_ID`).
- **Activa** el workflow (necesario para que la Production URL del Webhook responda).

### 3) Registrar el chatbot (Open Lines)
Sigue [`setup/register-imbot.md`](./setup/register-imbot.md): llama una vez a
`imbot.register` apuntando `EVENT_MESSAGE_ADD` a la Production URL del nodo Webhook,
guarda el `BOT_ID` en `BITRIX_BOT_ID`, captura el `application_token` en
`BITRIX_OUTBOUND_TOKEN`, y conecta el bot a tu Canal Abierto.

### 4) Ajustar prompt y campos
- Revisa [`prompts/system-prompt-demaco.md`](./prompts/system-prompt-demaco.md) para
  afinar el tono, el directorio de locales y los datos a capturar. El prompt vive en el
  nodo **"Contexto + memoria + prompt"** del workflow.
- Verifica los códigos de campo personalizado de Bitrix24 (`UF_CRM_1535722030` para
  RUC/Cédula del lead y `UF_CRM_5B89426D4565C` del contacto) en los nodos
  **"CRM: crear lead"** y **"CRM: actualizar contacto"**.

## Variante B: AI Agent + herramientas nativas (pasos específicos)

La variante B reutiliza el webhook entrante y el registro del bot (pasos 1 y 3 de arriba).
Lo específico es cómo conversa y cómo toca el CRM:

1. **Importa** `workflows/demaco-bot-agent-tools-n8n.json` en n8n. Requiere una versión de
   n8n con los nodos de **IA / LangChain** habilitados (AI Agent, Ollama Chat Model, Window
   Buffer Memory, HTTP Request Tool). Al importar, n8n puede pedirte ajustar la *typeVersion*
   de algún nodo: acéptalo.
2. **Credencial de Ollama en n8n.** Crea una credencial **"Ollama"** con la URL base de tu
   servidor (`http://localhost:11434` o la que corresponda) y asígnala al nodo
   **"Ollama Chat Model"**. (En esta variante la URL de Ollama va en la credencial, no en
   `OLLAMA_URL`.)
3. **Variables.** Define `BITRIX_WEBHOOK_URL`, `BITRIX_BOT_ID`, `BITRIX_OUTBOUND_TOKEN` y
   `OLLAMA_MODEL` (igual que la variante A). Las cuatro herramientas pegan al REST de Bitrix24
   con `BITRIX_WEBHOOK_URL`.
4. **Activa** el workflow. El nodo Webhook usa la ruta `demaco-bot-agent`; registra el bot
   apuntando `EVENT_MESSAGE_ADD` a **esa** Production URL.

> El agente decide cuándo usar cada herramienta (`crm_find_contact`, `crm_create_lead`,
> `crm_update_contact`, `openlines_transfer`). Cada una es un nodo *HTTP Request Tool* con
> *placeholders* que el modelo rellena. Para añadir RUC/Cédula u otros campos personalizados,
> agrega el código `UF_CRM_...` correspondiente en el `jsonBody` del nodo de la herramienta.
>
> *Alternativa:* si instalas el nodo de comunidad de Bitrix24 en tu n8n, puedes sustituir
> estos *HTTP Request Tool* por ese nodo configurado como herramienta del agente.

## Verificación end-to-end
1. **Ollama responde:**
   ```bash
   curl http://localhost:11434/api/chat -d '{
     "model":"llama3.1","stream":false,
     "messages":[{"role":"user","content":"Hola"}]}'
   ```
2. **Cliente nuevo:** escribe al Canal Abierto desde un número/email que NO exista en el
   CRM → el bot debe saludar, calificar y, al tener Nombre + contacto, **crear un Lead**.
   Revisa el log de la ejecución en n8n (la rama "crear_lead" del nodo *Acción CRM*).
3. **Cliente existente:** escribe desde un email/teléfono que SÍ exista como Contacto →
   el bot debe enfocarse en **actualizar la ficha** (rama "actualizar_ficha").
4. **Transferencia:** escribe `Operador` → el bot avisa y ejecuta la transferencia a un
   asesor (`imopenlines.bot.session.operator`).

## Notas y límites
- **Memoria de conversación:** se guarda en el *static data* del workflow, por
  `DIALOG_ID`. Es suficiente para una instancia única de n8n. Para alta concurrencia o
  varias instancias, sustitúyela por **Redis/Postgres** (o los nodos de *Memory* de
  n8n con el modelo de chat de Ollama).
- **Transferencia a asesor:** `imopenlines.bot.session.operator` espera el `CHAT_ID`
  numérico de la sesión. El workflow usa `CHAT_ID` si viene en el evento y, si no,
  recurre al `DIALOG_ID`. Ajusta según tu configuración de Open Lines.
- **Modelo:** cambia `OLLAMA_MODEL` (p. ej. `qwen2.5`, `llama3.1:8b-instruct`) si
  quieres otra calidad/idioma. `llama3.1` responde bien en español y en JSON.
- **Seguridad:** el nodo "Validar evento" descarta peticiones cuyo `application_token`
  no coincida con `BITRIX_OUTBOUND_TOKEN`. No publiques la URL del webhook entrante de
  Bitrix24 ni el `.env` con valores reales.
