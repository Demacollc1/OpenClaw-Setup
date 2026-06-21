# Prompt de sistema — Roberth (Demaco)

Este es el prompt que el workflow construye dinámicamente en el nodo
**"Contexto + memoria + prompt"**. Se documenta aquí para que sea fácil de revisar y
ajustar (tono, datos de locales, campos a capturar). Si lo cambias aquí, replica el
cambio en el nodo del workflow (o viceversa).

El prompt se arma con **dos variantes** según si el contacto ya existe en el CRM:

- **Prospecto nuevo** → misión de calificación (basada en el nodo `2` del bot original):
  capturar Nombre, persona natural o empresa, RUC/Cédula, razón social, Teléfono,
  Email, Ciudad y tipo de venta (B2B / B2C).
- **Cliente existente** → misión de actualización de ficha (nodo `4` del bot original):
  mantener Nombre, Email, Teléfono, Ciudad, RUC/Cédula y razón social; el cliente
  puede omitir con "Saltar".

Reglas comunes (de los prompts originales):
- Política de precios: B2B (mayoreo/ferretería) vs B2C (proyectos/público); se piden
  datos antes de cotizar.
- Disponibilidad/inventario → lo confirma un asesor.
- Horarios/ubicaciones → responder directamente con el directorio de locales.
- Entregas a domicilio → dirección, ciudad, geolocalización y contacto; transporte
  gratis sobre $50.00.
- Palabra "Operador" → transferir a un asesor humano.

## Salida estructurada (JSON)
El modelo responde SIEMPRE en JSON para que n8n pueda actuar de forma determinista:

```json
{
  "respuesta": "texto que se envía al cliente",
  "accion": "responder | crear_lead | actualizar_ficha | transferir",
  "datos": {
    "Nombre": "", "Telefono": "", "Email": "", "Ciudad": "",
    "Tipo_venta": "", "Ruc_cedula": "", "Razon_social": "",
    "Lista_productos": "", "Direccion_entrega": "", "Ciudad_entrega": "", "Contacto_entrega": ""
  }
}
```

- `transferir`: el cliente lo pide, dice "Operador", o ya se capturó el requerimiento
  y debe pasar a cotización con un asesor.
- `crear_lead`: prospecto nuevo con al menos Nombre + un dato de contacto.
- `actualizar_ficha`: cliente existente con datos nuevos confirmados.
- `responder`: continuar la conversación.

## Mapeo a campos de Bitrix24 (igual que el bot original)
| Campo IA | Entidad | Campo Bitrix24 |
|---|---|---|
| Nombre | lead/contact | `TITLE` / `NAME` |
| Razon_social | lead | `COMPANY_TITLE` |
| Telefono | lead | `PHONE` |
| Email | lead | `EMAIL` |
| Ciudad | lead | `ADDRESS_CITY` |
| Ruc_cedula | lead | `UF_CRM_1535722030` |
| Ruc_cedula | contact | `UF_CRM_5B89426D4565C` |

> Estos códigos de campo personalizado (`UF_CRM_...`) son los del Bitrix24 de Demaco.
> Si cambian, actualízalos en los nodos "CRM: crear lead" y "CRM: actualizar contacto".
