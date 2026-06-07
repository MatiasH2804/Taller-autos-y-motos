# Taller Mecanico - Web App

Aplicacion SPA para administrar un taller mecanico con HTML, CSS, JavaScript Vanilla y Google Apps Script.

## Arquitectura

- `index.html`: estructura principal de la SPA, menu lateral, vistas, loader, toasts y modal reutilizable.
- `styles.css`: dark mode profesional con fondo `#0b0b0b`, tarjetas `#161616`, bordes `#2a2a2a`, texto blanco y acento `#ff9f43`.
- `app.js`: frontend completo. Define `ApiService`, `UIService` y `StorageService`, renderiza vistas, tablas, formularios, filtros y CRUD.
- `Code.gs`: backend REST sencillo para Google Apps Script conectado a Google Sheets.
- `PEPINO.md`: documentacion del proyecto.

No usa frameworks, React, Vue ni Angular.

## Estructura De Carpetas

La carpeta debe contener unicamente:

```text
index.html
styles.css
app.js
Code.gs
PEPINO.md
```

## Flujo De Datos

1. Al abrir la app, `app.js` llama a `ApiService.getAll()`.
2. `getAll` consume el Apps Script publicado.
3. El backend lee las hojas de Google Sheets y devuelve JSON.
4. La SPA renderiza Dashboard, Clientes, Autos, Turnos, Servicios, Mecanicos y Mano de Obra.
5. Cada alta, edicion o borrado se envia al backend con `POST`.
6. Luego de guardar, la app vuelve a sincronizar los datos reales.
7. Si falla la conexion, se muestra un mensaje de error y se usa cache local si existe.

## Endpoints

Base actual configurada en `app.js`:

```text
https://script.google.com/macros/s/AKfycbw7Rnt0iwPWjbPXrPJUsOQGkWD32eyrDdKoonFViEX3iO_aYJQ9VEWDf41QVDSThjUH/exec
```

Lectura:

```text
GET ?action=getAll
GET ?action=getClientes
GET ?action=getAutos
GET ?action=getTurnos
GET ?action=getMecanicos
GET ?action=getServicios
GET ?action=getManoObra
```

Escritura:

```text
POST ?action=create
POST ?action=update
POST ?action=delete
```

Formato para crear:

```json
{
  "entity": "clientes",
  "values": {
    "Nombre": "Cliente",
    "Telefono": "123",
    "Observacion": "Observacion"
  }
}
```

Formato para actualizar:

```json
{
  "entity": "clientes",
  "id": "IDCliente-1",
  "values": {
    "Nombre": "Cliente editado"
  }
}
```

Formato para eliminar:

```json
{
  "entity": "clientes",
  "id": "IDCliente-1"
}
```

Entidades validas:

```text
clientes
autos
turnos
mecanicos
servicios
manoObra
```

## Hojas Y Columnas Esperadas

`Code.gs` trabaja con estas hojas:

- `CLIENTES`: `IDCliente`, `Nombre`, `Teléfono`, `Observación`
- `AUTOS`: `IDAuto`, `Patente`, `Marca`, `Modelo`, `Foto`, `Descripción`, `Cliente`
- `MECÁNICOS`: `IDMecanicos`, `Nombre y apellido`, `Especialidad`, `Número de teléfono`
- `SERVICIOS`: `IDServicio`, `Nombre`, `Precio`
- `TURNOS`: `IDTurno`, `Fecha y Hora`, `Cliente`, `Auto`, `Mecánico`, `Servicios`, `Foto`, `Video`, `Estado`, `Seña`, `Total`
- `MANO DE OBRA`: `IDMano`, `Turno`, `Mecánico`, `Tarea`, `Horas`, `Precio por Hora`, `Subtotal`

El backend incluye alias para campos sin tilde enviados desde el frontend, por ejemplo `Telefono` se guarda en `Teléfono`.

## Como Desplegar

1. Abrir la planilla de Google Sheets con las hojas indicadas.
2. Ir a `Extensiones > Apps Script`.
3. Pegar el contenido completo de `Code.gs`.
4. Guardar el proyecto.
5. Ir a `Implementar > Nueva implementacion`.
6. Tipo: `Aplicacion web`.
7. Ejecutar como: `Yo`.
8. Acceso: `Cualquier persona con el enlace`.
9. Implementar y autorizar permisos.
10. Copiar la URL terminada en `/exec`.

## Como Conectar El Apps Script

Si la URL cambia, editar en `app.js`:

```js
const API_URL = 'PEGAR_URL_DEL_APPS_SCRIPT';
```

Luego abrir `index.html` en el navegador. La app debe cargar datos reales desde el backend publicado.

## Funcionalidades

- Dashboard con cantidades de clientes, autos, turnos, mecanicos y servicios.
- ABM completo de Clientes.
- ABM completo de Autos con selector de Cliente.
- ABM completo de Mecanicos.
- ABM completo de Servicios.
- ABM completo de Turnos con filtros Hoy, Proximos y Todos.
- ABM completo de Mano de Obra.
- Calculo automatico de `Subtotal = Horas * Precio por Hora`.
- Loader global.
- Mensajes de exito y error sin `alert()`.
- Modales propios.
- Cache local de lectura para contingencia.

## Proximas Mejoras

- Filtro de autos por cliente seleccionado en Turnos.
- Carga real de fotos y videos con Drive.
- Historial por cliente y vehiculo.
- Control de pagos, saldos y facturacion.
- Estados configurables.
- Exportacion a PDF o Excel.
- Login y permisos por rol.
