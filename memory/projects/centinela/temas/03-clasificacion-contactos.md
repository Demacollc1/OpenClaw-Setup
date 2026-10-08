# 03 · Clasificación de contactos

Estado: **funcionando.**

## Qué hace
Al llegar un mensaje, el LLM (qwen3:8b) clasifica quién escribe:
`empleado · amigo · familia · cliente · proveedor · otro`.

## Multi-rol / multi-empresa
- Un mismo contacto puede tener **varios roles** (ej. "papá" y "jefe" a la vez) y pertenecer a **varias empresas**.
- La IA **desambigua por el contenido** del mensaje cuándo aplica cada rol/empresa.

## Empresas del grupo (del CSV `empresas.csv`)
Demaco, Alivio, GPS-ecuador/Seeworld, Macotrans, Servigomez, Construbonanza, Certifsa.
Cada caso se **etiqueta por empresa**.

## Datos
- Tabla `relaciones` (`FV3NFUwzv3iIT7LD`) guarda contacto ↔ rol(es) ↔ empresa(s).
- La clasificación alimenta el **router por audiencia** de los playbooks (ver `07-playbooks-router.md`).
