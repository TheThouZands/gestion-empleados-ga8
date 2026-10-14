# Ejecutar la colección local

1. Inicie MongoDB con `npm run db:start` desde la raíz del proyecto.
2. En otra terminal, ejecute `npm start`.
3. En Postman, use el botón **Import**. Si la ventana es estrecha, amplíela para ver los controles de la barra superior.
4. Elija **Files** o el selector de archivos de esa ventana. Seleccione `GA8-empleados.postman_collection.json`, en esta misma carpeta. Confirme la importación.
5. Abra **Collections**, en el lateral izquierdo. Seleccione **GA8-220501096-AA1-EV01 · Gestión de empleados**.
6. Abra el menú de la colección y elija **Run collection**, o use **Run** si está visible en su página.
7. Mantenga una iteración y las diez solicitudes en el orden original. Inicie la ejecución.
8. Compruebe que las diez solicitudes y las 25 aserciones terminan sin fallos.

La colección incluye sus propias variables. No necesita seleccionar un entorno. `baseUrl` apunta a `http://127.0.0.1:3210`. El identificador del empleado se obtiene de la respuesta del POST. El DELETE elimina solo el registro creado por esa ejecución.

Los casos con HTTP 400, 404 y 422 son pruebas de rechazo. Se consideran correctos cuando sus aserciones pasan.

También puede ejecutar la colección desde una terminal:

```powershell
npm exec --yes --package newman -- newman run docs/postman/GA8-empleados.postman_collection.json
```

Esta ejecución usa el mismo formato de colección y los mismos scripts. Newman se descarga como herramienta de prueba; no es una dependencia de la aplicación. Si una solicitud falla, compruebe que la API y MongoDB están abiertos. No cambie la colección para usar un servidor remoto.
