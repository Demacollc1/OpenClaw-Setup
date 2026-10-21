# 14 · Base de conocimiento DEMACO (para playbooks / RAG)

Extraída del MVP Bitrix (ver `13`). Datos verídicos para que el bot responda sin inventar. Útil para el agente v7 y, más adelante, RAG en qdrant.

## Empresa
Demaco = distribuidor de ferretería en Ecuador (B2B mayoreo y B2C consumidor final). En Google Maps aparece como "Demaco".

## Locales y horarios (teléfonos / correos)
| Local | Dirección | Tel | Correo |
|---|---|---|---|
| Guayaquil Matriz (B2) | Cjon. 2do Cjon. 14A N-E y Psje. Francisco Illingworth, Cdla. Santa Leonor | (04)606-592 / (04)606-602 | ventas@demaco.ec |
| Guayaquil Américas (B41) | Psje. 2do Paseo 14 N-E y Av. de las Américas | (04)228-9000 | — |
| Guayaquil Centro (B1) | Machala y Colón, C. 8 S-O | (04)232-6635 | ventas@demaco.ec |
| Guayaquil Portete (B87) | Urb. Jardines del Salado, Vía a la Costa | (04)287-9335 | ventas@demaco.ec |
| Quito Norte (B10) | — | (02)223-2431 / 0967471632 | quito@demaco.ec |
| Quito Sur (B15) | — | (02)2438737 | quito@demaco.ec |
| Ambato Centro (B25) | — | (03)282-5866 | izamba@demaco.ec |
| Ambato Sur (B26) | — | (03)241-9114 | ambato3@demaco.ec |
| Ambato Norte (B23) | — | (03)285-4099 | ambato2@demaco.ec |
| Portoviejo (B50) | — | (05)293-4819 | portoviejo@demaco.ec |

## Políticas
- **Transporte a domicilio GRATIS** para compras superiores a **$50.00**.
- Para entregas se pide: dirección, ciudad, geolocalización y contacto de quien recibe.
- **Precios**: varían entre B2B y B2C → un **asesor confirma** precios/cotizaciones (el bot no los da).
- **Stock/disponibilidad puntual**: lo confirma un asesor.

## Uso
- Inyectar como contexto en el agente de playbooks (v7) para intenciones de info (horarios, locales, políticas, envíos).
- Cuando crezca, mover a **qdrant** + `nomic-embed-text` (RAG) en vez de embeber en el prompt.
