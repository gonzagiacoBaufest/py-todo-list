# TODO List API

Backend REST API para gestión de tareas (TODO list) construido con FastAPI y SQLAlchemy.

Incluye un frontend servido por la misma aplicación en `/`, construido con HTML, CSS y JavaScript vanilla.

Los datos se almacenan en una base de datos SQLite en memoria, por lo que se reinician al detener el servidor.

## Requisitos

- Python 3.12+

## Instalación

```bash
pip install -r requirements.txt
```

## Ejecución

```bash
python -m uvicorn app.main:app --reload
```

El servidor se levanta en `http://localhost:8000`.

Al abrir esa URL se muestra la interfaz web para crear, editar, completar y eliminar tareas.

## Endpoints

| Método   | Ruta            | Descripción                                      |
|----------|-----------------|--------------------------------------------------|
| `POST`   | `/todos/`       | Crear un nuevo todo                              |
| `GET`    | `/todos/`       | Listar todos (filtro opcional `?completed=true`)  |
| `GET`    | `/todos/{id}`   | Obtener un todo por ID                           |
| `PUT`    | `/todos/{id}`   | Actualizar un todo                               |
| `DELETE` | `/todos/{id}`   | Eliminar un todo                                 |

## Ejemplos

Crear un todo:

```bash
curl -X POST http://localhost:8000/todos/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Comprar leche", "description": "En el supermercado"}'
```

Listar todos:

```bash
curl http://localhost:8000/todos/
```

Actualizar un todo:

```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Eliminar un todo:

```bash
curl -X DELETE http://localhost:8000/todos/1
```
