# Capas CRUD y Service

Copiar `app/crud` y `app/services` dentro del paquete `app` existente.

## Responsabilidades

- `crud`: consultas y mutaciones SQLAlchemy. Usa `flush()` para detectar errores
  y obtener valores generados, pero no confirma ni revierte transacciones.
- `services`: reglas de negocio, coordinación entre repositorios y conversión a
  contratos de dominio. No conoce FastAPI ni recibe una `Session`.
- dependencia `get_db_session`: debe ejecutar un único `commit()` al finalizar
  correctamente la petición, o `rollback()` ante una excepción.

```python
def get_db_session() -> Generator[Session, None, None]:
    with get_session_factory()() as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
```

## Construcción de servicios

Los services simples reciben un repositorio del mismo dominio. Los services que
coordinan una operación atómica reciben todos los repositorios involucrados:

- `OperationService`: operaciones, máquinas, consumibles, empaques y técnicos.
- `SystemService`: técnicos, empaques, máquinas, consumibles y visitas.

Todos esos repositorios deben construirse con la misma `Session` de la petición.

## Consideraciones de integración

- Las funciones son sincrónicas porque utilizan `sqlalchemy.orm.Session`.
- `UnvisitedAlert` debe declarar `nombre`, `ubicacion`, `dias_sin_visita` como
  `int`, `ultima_visita` opcional y `urgencia` (`alta` o `media`).
- El token generado por `SystemService.login` es provisional. Sustituirlo por el
  mecanismo persistente o JWT elegido por la aplicación antes de producción.
- `VisitService.export_zip` exporta reportes JSON dentro del ZIP. La generación
  del PDF Sinclair puede reemplazar ese contenido sin modificar el CRUD.
