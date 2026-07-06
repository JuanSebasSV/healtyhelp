---
description: "Revisa procesos de dev server duplicados antes de diagnosticar problemas de caché"
---
Ejecutá `ps aux | grep -E "vite|node" | grep -v grep` y reportá si hay más de un proceso
del mismo servidor corriendo. Si los hay, preguntame si querés que los mate y reinicie uno limpio.
