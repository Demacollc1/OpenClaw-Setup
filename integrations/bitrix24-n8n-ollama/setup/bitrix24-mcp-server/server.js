// Servidor MCP (Model Context Protocol) para Bitrix24.
//
// Expone, vía transporte SSE, cuatro herramientas que el AI Agent de n8n
// (modelo Ollama llama3.1) invoca para operar el CRM de Demaco:
//   - crm_find_contact     buscar contacto por email/telefono
//   - crm_create_lead      crear un Lead
//   - crm_update_contact   actualizar la ficha de un contacto
//   - openlines_transfer   transferir la sesion a un asesor humano
//
// Todas las llamadas pasan por el webhook ENTRANTE de Bitrix24 (BITRIX_WEBHOOK_URL),
// que es la misma credencial que usa el resto de la integracion.
//
// Endpoint para n8n (nodo "MCP Client Tool"):  http://<host>:<MCP_PORT>/sse
// (es el valor que va en la variable BITRIX_MCP_URL del workflow).

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL; // .../rest/1/XXXX (sin barra final)
const MCP_PORT = parseInt(process.env.MCP_PORT || "3001", 10);
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || ""; // opcional: protege el endpoint
const RUC_FIELD_LEAD = process.env.BITRIX_RUC_FIELD_LEAD || "UF_CRM_1535722030";
const RUC_FIELD_CONTACT = process.env.BITRIX_RUC_FIELD_CONTACT || "UF_CRM_5B89426D4565C";

if (!BITRIX_WEBHOOK_URL) {
  console.error("Falta la variable de entorno BITRIX_WEBHOOK_URL");
  process.exit(1);
}

// Llama a un metodo REST de Bitrix24 sobre el webhook entrante.
async function bitrix(method, payload) {
  const url = `${BITRIX_WEBHOOK_URL.replace(/\/$/, "")}/${method}.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (data && data.error) {
    throw new Error(`${data.error}: ${data.error_description || ""}`);
  }
  return data;
}

function ok(obj) {
  return { content: [{ type: "text", text: JSON.stringify(obj) }] };
}

function buildServer() {
  const server = new McpServer({ name: "bitrix24-crm", version: "0.1.0" });

  // --- 1) Buscar contacto por email o telefono -----------------------------
  server.tool(
    "crm_find_contact",
    "Busca un contacto en el CRM de Bitrix24 por email o telefono. Devuelve si existe y su id. Usar al inicio de cada conversacion nueva.",
    {
      email: z.string().optional().describe("Email del cliente, si se conoce"),
      phone: z.string().optional().describe("Telefono del cliente, si se conoce"),
    },
    async ({ email, phone }) => {
      const type = email ? "EMAIL" : "PHONE";
      const value = email || phone;
      if (!value) return ok({ exists: false, reason: "sin email ni telefono" });
      const data = await bitrix("crm.duplicate.findbycomm", {
        entity_type: "CONTACT",
        type,
        values: [value],
      });
      const ids = (data.result && (data.result.CONTACT || data.result.contact)) || [];
      const exists = Array.isArray(ids) && ids.length > 0;
      return ok({ exists, contactId: exists ? String(ids[0]) : "" });
    }
  );

  // --- 2) Crear lead --------------------------------------------------------
  server.tool(
    "crm_create_lead",
    "Crea un Lead en Bitrix24 para un prospecto NUEVO. Requiere al menos nombre y un dato de contacto.",
    {
      nombre: z.string().describe("Nombre del prospecto"),
      telefono: z.string().optional(),
      email: z.string().optional(),
      ciudad: z.string().optional(),
      tipo_venta: z.string().optional().describe("B2B mayoreo o B2C consumidor final"),
      ruc_cedula: z.string().optional(),
      razon_social: z.string().optional(),
      lista_productos: z.string().optional().describe("Requerimiento de productos del cliente"),
    },
    async (a) => {
      const fields = {
        TITLE: `${a.nombre || "Prospecto"} - Chat Demaco`,
        NAME: a.nombre || "",
        SOURCE_ID: "WEB",
        STATUS_ID: "DETAILS",
        ADDRESS_CITY: a.ciudad || "",
        COMPANY_TITLE: a.razon_social || "",
        COMMENTS: `Tipo de venta: ${a.tipo_venta || ""}. Requerimiento: ${a.lista_productos || ""}`,
        [RUC_FIELD_LEAD]: a.ruc_cedula || "",
      };
      if (a.telefono) fields.PHONE = [{ VALUE: a.telefono, VALUE_TYPE: "WORK" }];
      if (a.email) fields.EMAIL = [{ VALUE: a.email, VALUE_TYPE: "WORK" }];
      const data = await bitrix("crm.lead.add", { fields });
      return ok({ leadId: data.result || null });
    }
  );

  // --- 3) Actualizar contacto existente ------------------------------------
  server.tool(
    "crm_update_contact",
    "Actualiza la ficha de un contacto EXISTENTE en Bitrix24. Requiere el id devuelto por crm_find_contact.",
    {
      contactId: z.string().describe("Id del contacto a actualizar"),
      nombre: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      ruc_cedula: z.string().optional(),
      razon_social: z.string().optional(),
    },
    async (a) => {
      const fields = {};
      if (a.nombre) fields.NAME = a.nombre;
      if (a.razon_social) fields.COMPANY_TITLE = a.razon_social;
      if (a.ruc_cedula) fields[RUC_FIELD_CONTACT] = a.ruc_cedula;
      if (a.telefono) fields.PHONE = [{ VALUE: a.telefono, VALUE_TYPE: "WORK" }];
      if (a.email) fields.EMAIL = [{ VALUE: a.email, VALUE_TYPE: "WORK" }];
      const data = await bitrix("crm.contact.update", { id: a.contactId, fields });
      return ok({ updated: data.result === true, contactId: a.contactId });
    }
  );

  // --- 4) Transferir a asesor ----------------------------------------------
  server.tool(
    "openlines_transfer",
    "Transfiere la sesion del Canal Abierto a un asesor humano. Usar cuando el cliente pide 'Operador' o ya hay que cotizar.",
    {
      chatId: z.string().describe("CHAT_ID numerico de la sesion de Open Lines"),
    },
    async ({ chatId }) => {
      const data = await bitrix("imopenlines.bot.session.operator", { CHAT_ID: chatId });
      return ok({ transferred: data.result !== undefined, chatId });
    }
  );

  return server;
}

// --- Transporte SSE + Express ----------------------------------------------
const app = express();
const transports = {};

// Auth opcional por Bearer token (recomendado si el MCP es accesible en red).
app.use((req, res, next) => {
  if (!MCP_AUTH_TOKEN) return next();
  const auth = req.headers["authorization"] || "";
  if (auth === `Bearer ${MCP_AUTH_TOKEN}`) return next();
  res.status(401).end("Unauthorized");
});

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => { delete transports[transport.sessionId]; });
  const server = buildServer();
  await server.connect(transport);
});

app.post("/messages", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (!transport) return res.status(400).send("Sesion MCP desconocida");
  await transport.handlePostMessage(req, res, req.body);
});

app.listen(MCP_PORT, () => {
  console.log(`Bitrix24 MCP server escuchando en http://0.0.0.0:${MCP_PORT}/sse`);
});
