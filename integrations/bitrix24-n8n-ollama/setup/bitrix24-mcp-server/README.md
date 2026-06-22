# Servidor MCP de Bitrix24 (para el AI Agent de n8n)

Servidor **MCP (Model Context Protocol)** que expone las operaciones de CRM de Bitrix24
como **herramientas** para el nodo *AI Agent* de n8n (modelo **Ollama `llama3.1`**). Así el
agente decide por sí mismo cuándo buscar un contacto, crear un Lead, actualizar una ficha o
transferir a un asesor, en lugar de tener esa lógica cableada en nodos del workflow.

## Herramientas expuestas

| Herramienta MCP | Método REST de Bitrix24 | Para qué |
|---|---|---|
| `crm_find_contact` | `crm.duplicate.findbycomm` | ¿El cliente ya existe? (por email/teléfono) |
| `crm_create_lead` | `crm.lead.add` | Crear Lead para prospecto nuevo |
| `crm_update_contact` | `crm.contact.update` | Actualizar ficha de contacto existente |
| `openlines_transfer` | `imopenlines.bot.session.operator` | Pasar la sesión a un asesor humano |

## Puesta en marcha

```bash
cd integrations/bitrix24-n8n-ollama/setup/bitrix24-mcp-server
cp .env.example .env          # edita BITRIX_WEBHOOK_URL (y MCP_AUTH_TOKEN si quieres)
npm install
node --env-file=.env server.js     # Node 20+; o exporta las variables y `npm start`
# -> Bitrix24 MCP server escuchando en http://0.0.0.0:3001/sse
```

> Requiere **Node.js 20+** (usa `fetch` nativo y `--env-file`). Para Node 18 exporta las
> variables manualmente y usa `npm start`.

## Conectarlo al workflow de n8n

1. En el workflow **`demaco-bot-agent-mcp-n8n.json`**, el nodo **"Bitrix24 MCP (CRM)"**
   lee su endpoint de la variable **`BITRIX_MCP_URL`**.
2. Define esa variable apuntando al SSE de este servidor, p. ej.:
   - mismo host: `BITRIX_MCP_URL=http://localhost:3001/sse`
   - n8n en Docker, MCP en el host: `BITRIX_MCP_URL=http://host.docker.internal:3001/sse`
   - otra máquina: `BITRIX_MCP_URL=http://IP_DEL_MCP:3001/sse`
3. Si configuraste `MCP_AUTH_TOKEN`, en el nodo *MCP Client Tool* cambia **Authentication**
   a *Bearer* y pega el mismo token.

## Probar el servidor por separado

```bash
# Lista las herramientas disponibles (handshake MCP por SSE):
npx @modelcontextprotocol/inspector
# y apunta el inspector a  http://localhost:3001/sse
```

## Notas

- **Es el único punto que toca el CRM.** El webhook entrante de Bitrix24 vive solo aquí (y
  en el nodo de envío de mensajes), no en el modelo. Mantén `.env` fuera de control de
  versiones.
- **Campos personalizados:** ajusta `BITRIX_RUC_FIELD_LEAD` / `BITRIX_RUC_FIELD_CONTACT` a
  los códigos `UF_CRM_...` de tu cuenta (en Bitrix24: CRM → Ajustes → Campos personalizados).
- **Alternativa sin código propio:** si prefieres un MCP de Bitrix24 mantenido por la
  comunidad, puedes sustituir este servidor por uno existente; basta con que exponga
  herramientas equivalentes y un endpoint SSE para `BITRIX_MCP_URL`. Los nombres de las
  herramientas en el system prompt del agente deberán coincidir con los del servidor que uses.
