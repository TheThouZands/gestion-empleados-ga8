# Gestión de empleados

Aplicación independiente para **GA8-220501096-AA1-EV01**, ficha 3235889. Integra un formulario Angular, una API REST de Express y una base de datos MongoDB. El ejercicio registra nombre, cargo, oficina y salario.

La pantalla muestra una tabla con los empleados guardados en MongoDB. El botón **+** abre el formulario. **Guardar** envía los datos al servidor. Después de guardar, el formulario se cierra y la tabla se actualiza. **Limpiar** borra los campos sin guardar. El servidor también permite consultar, actualizar y eliminar registros mediante la API.

Repositorio público: [TheThouZands/gestion-empleados-ga8](https://github.com/TheThouZands/gestion-empleados-ga8).

## Requisitos

- Node.js 24 LTS, desde 24.15.0 y anterior a 25.
- npm. La versión verificada es 11.13.0.
- Internet para instalar dependencias y descargar MongoDB en el primer inicio.
- Tres terminales para desarrollo, o dos para ejecutar la interfaz compilada.

No necesita Supabase, Docker, credenciales ni una cuenta externa. El primer inicio de MongoDB descarga el ejecutable oficial de la versión 8.2.6. En Windows, la descarga verificada ocupa aproximadamente 780 MB. Este archivo queda en la caché local; no está en el repositorio ni en el ZIP.

## Ejecutar la aplicación compilada

Extraiga el ZIP antes de ejecutar comandos. Abra una terminal en la carpeta `gestion-empleados` que contiene `package.json`.

```powershell
npm ci
npm run build
npm run db:start
```

Deje esa terminal abierta. En otra terminal, desde la misma carpeta, ejecute:

```powershell
npm start
```

Abra [http://127.0.0.1:3210](http://127.0.0.1:3210). Express sirve la API y la interfaz compilada desde el mismo origen. El paquete de entrega ya contiene la compilación en `frontend/dist/frontend`; puede omitir `npm run build` si usa esos archivos sin modificar el código.

No abra `index.html` directamente. El formulario necesita el servidor HTTP y MongoDB.

## Desarrollo

Mantenga `npm run db:start` abierto. En una segunda terminal, ejecute:

```powershell
npm run dev:api
```

En una tercera terminal, ejecute:

```powershell
npm run dev:ui
```

Abra [http://127.0.0.1:4210](http://127.0.0.1:4210). Angular recarga la interfaz cuando cambia el código. Su proxy envía `/api` al puerto 3210.

## Configuración y persistencia

Los valores predeterminados están en `.env.example`. No es necesario crear `.env` para usar la configuración local. Si necesita cambiarla, copie `.env.example` a `.env` y ajuste sus valores.

| Valor           | Predeterminado                                    | Uso                           |
| --------------- | ------------------------------------------------- | ----------------------------- |
| `PORT`          | `3210`                                            | Puerto HTTP de Express        |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27108/gestion_empleados_dev` | Base de datos de desarrollo   |
| `CLIENT_ORIGIN` | `http://127.0.0.1:4210`                           | Origen permitido para Angular |

`npm run db:start` inicia un proceso real de MongoDB en el puerto **27108**, con almacenamiento WiredTiger. Los registros permanecen en `.local/mongodb` después de cerrar o reiniciar la aplicación. No borre esa carpeta si necesita conservar los datos. La caché del ejecutable está en `.local/mongo-binaries`.

El lanzador usa siempre el puerto 27108. Si cambia la URI, inicie y configure su propio servidor MongoDB local. El validador de configuración solo admite direcciones locales. Esto evita conectar este ejercicio por error a una base remota.

Use `Ctrl+C` en cada terminal para cerrar los servicios. Cierre primero la API y después MongoDB. Si un puerto está ocupado, cierre la instancia anterior antes de iniciar otra.

## API y datos

| Método | Ruta                 | Resultado                                        |
| ------ | -------------------- | ------------------------------------------------ |
| GET    | `/api/health`        | Estado del servicio                              |
| GET    | `/api/empleados`     | Lista de empleados                               |
| POST   | `/api/empleados`     | Crea un empleado; HTTP 201 y cabecera `Location` |
| GET    | `/api/empleados/:id` | Consulta un empleado                             |
| PUT    | `/api/empleados/:id` | Sustituye los cuatro campos editables            |
| DELETE | `/api/empleados/:id` | Elimina un empleado                              |

POST y PUT reciben JSON con estas propiedades, y ninguna adicional:

```json
{
  "name": "Ana Torres",
  "position": "Analista",
  "office": "Bogotá",
  "salary": 2500000
}
```

Los tres textos son obligatorios. Cada texto admite hasta 120 caracteres. El salario debe ser numérico, entre 0 y 1000000000, con un máximo de dos decimales. Se admite cero cuando el usuario lo introduce. La API devuelve `_id`, los cuatro campos y un mensaje según la operación. MongoDB también conserva fechas internas de creación y edición.

La tabla consulta los registros mediante GET al abrir la página y después de cada cambio. Al recargar, vuelve a mostrar los datos de MongoDB. Los salarios usan separadores de número en español. No se añade una pantalla de confirmación después de guardar.

Cada fila tiene una acción de eliminación. El diálogo muestra el nombre del empleado y permite cancelar antes de enviar DELETE. Durante la solicitud, se bloquean los envíos repetidos. Si el servidor falla, el registro permanece visible y el diálogo permite otro intento.

Guardar y eliminar muestran un toast de Materialize en la parte inferior. El aviso desaparece automáticamente después de unos segundos. La tabla permanece visible y es la fuente principal de información.

Los rechazos usan JSON con `error.code` y `error.message`. Los estados principales son 400 para identificadores o JSON inválidos, 404 para recursos ausentes, 413 para cuerpos demasiado grandes, 415 para otro tipo de contenido y 422 para datos de empleado inválidos. Un fallo interno devuelve 500 sin exponer su detalle al cliente.

## Pruebas y comprobaciones

```powershell
npm test
npm run test:ui
npm run check
npm run lint
npm run format:check
npm run build
```

`npm test` ejecuta las pruebas del backend. La prueba de integración inicia MongoDB en un puerto libre y una carpeta de prueba separada. Comprueba CRUD, solicitudes HTTP reales y persistencia tras un reinicio completo. Al terminar, elimina solo su carpeta temporal. No usa ni elimina la base de desarrollo.

`npm run test:ui` ejecuta las pruebas de Angular con Vitest. Comprueba el servicio HTTP, la validación, el restablecimiento de campos, la conservación de datos ante errores y el diálogo de registro.

## Postman

Con MongoDB y Express abiertos, importe `docs/postman/GA8-empleados.postman_collection.json` con el botón **Import** de Postman. Abra la colección y pulse **Run**. Ejecute las diez solicitudes en su orden original. No necesita un entorno adicional.

La colección define `baseUrl=http://127.0.0.1:3210`. Guarda automáticamente `employeeId` al crear el empleado. Los casos de eliminación usan solo ese identificador. La colección rechaza un destino que no sea `http://127.0.0.1:puerto`. Consulte `docs/postman/README.md` para ver los pasos completos.

## Organización

- `frontend/src/app/employees`: contrato de datos, servicio HTTP y formulario reutilizable.
- `backend/src/routes` y `controllers`: rutas y respuestas HTTP.
- `backend/src/services`: validación y coordinación de operaciones.
- `backend/src/repositories`: acceso a MongoDB.
- `backend/src/models`: esquema Mongoose y vista pública de los datos.
- `backend/src/validation`: contratos Zod de entrada.
- `backend/test`: pruebas unitarias y de integración.
- `scripts`: inicio de MongoDB local.

La interfaz no consulta MongoDB directamente. El backend no importa componentes de Angular. El repositorio de datos se inyecta en el servicio para comprobar cada capa por separado.

## Seguridad y alcance

Este ejercicio escucha solo en `127.0.0.1`. Use datos ficticios. No publique la API para datos reales de personal sin añadir autenticación, autorización y una configuración de despliegue apropiada.

La validación se aplica en Angular, Zod y Mongoose. El servidor limita el JSON a 16 KB, restringe los orígenes del navegador y usa cabeceras de Helmet. CORS no sustituye la autenticación. La compilación carga CSS desde archivos externos y no requiere habilitar scripts en línea.

`.env`, `.local`, dependencias, archivos del IDE y compilaciones no se versionan. El ZIP de entrega incluye la compilación y el PDF de evidencia por separado del historial Git.
