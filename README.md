# Gestión de empleados

Aplicación de práctica para GA8-220501096-AA1-EV01, ficha 3235889.
El proyecto reproduce el ejercicio de integración entre cliente web, API REST y MongoDB.

## Requisitos

Use Node.js 24.15 o una versión posterior de la rama 24.
Instale las dependencias desde la carpeta raíz con `npm ci`.

## Servidor

Ejecute `npm run db:start` en una terminal. El primer inicio descarga MongoDB 8.2.6.
Los siguientes inicios usan el binario guardado en `.local/mongo-binaries`.
El proceso guarda los datos en `.local/mongodb` y escucha solo en la interfaz local.
No borre esa carpeta si necesita conservar los registros.

Ejecute `npm run dev:api`. El servidor escucha en `http://127.0.0.1:3210`.
Consulte `GET /api/health` para comprobar el servicio.

## Comprobaciones

Ejecute `npm test`, `npm run lint` y `npm run check`.
Use solo datos de prueba. No introduzca datos personales reales.
