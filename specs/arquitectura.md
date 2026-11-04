# Arquitectura de Despliegue en Producción (Windows Nativo)

## 1. Contexto y Motivo de esta Arquitectura
El servidor de producción corre sobre una versión corporativa antigua de **Windows 10 (compilación 1607 / año 2016, edición Enterprise/LTSB)**.
- **Por qué no se usa Docker Desktop:** Los instaladores modernos de Docker Desktop requieren la función de sistema `IsWow64Process2` en `kernel32.dll` (introducida por Microsoft a finales de 2017 en Windows 10 v1709+) y soporte moderno de WSL2.
- **Solución adoptada:** Despliegue **100% nativo en Windows** replicando exactamente los 3 servicios definidos en `docker-compose.yaml`, gestionados como Servicios de Windows mediante **NSSM (Non-Sucking Service Manager)** para garantizar inicio automático con el sistema y reinicio ante fallos.

---

## 2. Ubicaciones y Rutas en el Servidor

| Componente | Ruta en el Servidor | Detalle |
| :--- | :--- | :--- |
| **Repositorio raíz** | `D:\Archivos Antonio\CyC\gestor_visitas` | Rama `prod` |
| **Backend (FastAPI)** | `D:\Archivos Antonio\CyC\gestor_visitas\backend` | Entorno virtual en `.venv` |
| **Frontend (React/Vite)** | `D:\Archivos Antonio\CyC\gestor_visitas\frontend` | Compilado estático en `frontend\dist` |
| **Logs de aplicación** | `D:\Archivos Antonio\CyC\gestor_visitas\logs` | `backend.log` y `nginx-service.log` |
| **Servidor Web Nginx** | `C:\nginx` | Archivos públicos en `C:\nginx\html` |
| **Configuración Nginx** | `C:\nginx\conf\nginx.conf` | Escucha en puerto `80` y hace proxy a `:8000` |
| **Gestor de Servicios** | `C:\Windows\System32\nssm.exe` | Ejecutable de 64 bits (`win64`) |

---

## 3. Componentes y Servicios de Windows

El sistema funciona mediante **3 servicios de Windows** con inicio automático (`Automatic`):

1. **Base de Datos (`postgresql-x64-16`):**
   - Motor: PostgreSQL 16 nativo en Windows.
   - Puerto local: **`5432`** (Nota: en desarrollo con Docker se usa `5433`, pero en producción Windows corre en el puerto estándar `5432`).
   - Base de datos: `gestor_visitas` (Usuario: `postgres`).

2. **Backend API (`GestorVisitasBackend` - gestionado por NSSM):**
   - Ejecutable: `D:\Archivos Antonio\CyC\gestor_visitas\backend\.venv\Scripts\python.exe`
   - Argumentos: `-u -m uvicorn app.main:app --host 127.0.0.1 --port 8000`
   - Directorio de trabajo: `D:\Archivos Antonio\CyC\gestor_visitas\backend`
   - Variables de entorno inyectadas por NSSM (`AppEnvironmentExtra`):
     - `DATABASE_URL=postgresql://postgres:1234@127.0.0.1:5432/gestor_visitas`
     - `PYTHONUNBUFFERED=1`
   - *(Importante: Se inyecta `DATABASE_URL` desde NSSM para no modificar `backend/app/db/config.py` ni `.env`, manteniendo intacta la configuración del entorno de desarrollo).*

3. **Frontend + Reverse Proxy (`GestorVisitasNginx` - gestionado por NSSM):**
   - Ejecutable: `C:\nginx\nginx.exe`
   - Directorio de trabajo: `C:\nginx`
   - Función: Sirve los archivos estáticos compilados en `C:\nginx\html` en el puerto `80` y redirige todas las peticiones `/api/` hacia `http://127.0.0.1:8000/`.

---

## 4. Guía Rápida: Cómo Actualizar el Sistema en Producción

Cada vez que se suban nuevos cambios a la rama `prod`, ejecutar los siguientes pasos en **PowerShell (como Administrador)** en el servidor:

### Paso 1: Descargar últimos cambios del repositorio
```powershell
cd "D:\Archivos Antonio\CyC\gestor_visitas"
git checkout prod
git pull origin prod
```

### Paso 2: Si hubo cambios en el Backend (Python / Base de Datos)
```powershell
cd "D:\Archivos Antonio\CyC\gestor_visitas\backend"
.\.venv\Scripts\Activate.ps1

# 1. Instalar nuevas librerías (si cambió requirements.txt)
pip install -r requirements.txt

# 2. Correr migraciones de base de datos (si hay nuevas versiones en migrations/versions)
$env:DATABASE_URL="postgresql://postgres:1234@127.0.0.1:5432/gestor_visitas"
alembic upgrade head

# 3. Reiniciar el servicio del Backend para aplicar cambios
nssm restart GestorVisitasBackend
```

### Paso 3: Si hubo cambios en el Frontend (React / Vite)
```powershell
cd "D:\Archivos Antonio\CyC\gestor_visitas\frontend"

# 1. Instalar dependencias (si cambió package.json) y compilar
npm install
npm run build

# 2. Reemplazar los archivos compilados en la carpeta html de Nginx
Remove-Item "C:\nginx\html\*" -Recurse -Force
Copy-Item "D:\Archivos Antonio\CyC\gestor_visitas\frontend\dist\*" -Destination "C:\nginx\html\" -Recurse -Force

# 3. Reiniciar Nginx (opcional, para limpiar caché)
nssm restart GestorVisitasNginx
```

---

## 5. Monitoreo, Logs y Comandos Útiles

### Ver la terminal del Backend en vivo (equivalente a `docker logs -f`)
```powershell
Get-Content "D:\Archivos Antonio\CyC\gestor_visitas\logs\backend.log" -Wait -Tail 50
```

### Verificar el estado de los 3 servicios
```powershell
Get-Service *postgres*, GestorVisitasBackend, GestorVisitasNginx | Select-Object Name, Status, StartType
```

### Comandos de control con NSSM
```powershell
# Reiniciar servicios
nssm restart GestorVisitasBackend
nssm restart GestorVisitasNginx

# Detener servicios
nssm stop GestorVisitasBackend
nssm stop GestorVisitasNginx

# Iniciar servicios
nssm start GestorVisitasBackend
nssm start GestorVisitasNginx

# Abrir interfaz gráfica de NSSM para ver o editar configuración de un servicio
nssm edit GestorVisitasBackend
```

---

## 6. Referencia de Configuración Inicial (Desde Cero)

### Configuración de `C:\nginx\conf\nginx.conf`
Dentro del bloque `server { listen 80; ... }`, las rutas deben estar configuradas así:
```nginx
        location / {
            root   html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:8000/;
        }
```

### Regla de Firewall para acceso en Red Local (LAN)
Para permitir que otras PCs de la red accedan a la IP fija del servidor por el puerto 80:
```powershell
New-NetFirewallRule -DisplayName "Nginx HTTP 80" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

### Comandos de recreación de servicios con NSSM
```powershell
# --- SERVICIO BACKEND ---
nssm install GestorVisitasBackend "D:\Archivos Antonio\CyC\gestor_visitas\backend\.venv\Scripts\python.exe" "-u -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
nssm set GestorVisitasBackend AppDirectory "D:\Archivos Antonio\CyC\gestor_visitas\backend"
nssm set GestorVisitasBackend AppEnvironmentExtra "DATABASE_URL=postgresql://postgres:1234@127.0.0.1:5432/gestor_visitas" "PYTHONUNBUFFERED=1"
nssm set GestorVisitasBackend AppStdout "D:\Archivos Antonio\CyC\gestor_visitas\logs\backend.log"
nssm set GestorVisitasBackend AppStderr "D:\Archivos Antonio\CyC\gestor_visitas\logs\backend.log"
nssm set GestorVisitasBackend DependOnService postgresql-x64-16
nssm start GestorVisitasBackend

# --- SERVICIO NGINX ---
nssm install GestorVisitasNginx "C:\nginx\nginx.exe"
nssm set GestorVisitasNginx AppDirectory "C:\nginx"
nssm set GestorVisitasNginx AppStdout "D:\Archivos Antonio\CyC\gestor_visitas\logs\nginx-service.log"
nssm set GestorVisitasNginx AppStderr "D:\Archivos Antonio\CyC\gestor_visitas\logs\nginx-service.log"
nssm start GestorVisitasNginx
```

### Restauración de Backups `.sql` en PostgreSQL
1. Abrir **SQL Shell (psql)** y conectarse a la base `gestor_visitas`.
2. Ejecutar con barras `/` y comillas simples (por si la ruta tiene espacios):
   ```sql
   \i 'D:/ruta/al/archivo_backup.sql'
   ```
   *(Nota: Si el backup fue generado con PostgreSQL 16.10+ e incluye las líneas `\restrict` y `\unrestrict` al inicio y final del archivo, borrarlas si la versión local de `psql` es anterior. Además, el dump ejecuta `SELECT pg_catalog.set_config('search_path', '', false);`, por lo que para listar las tablas luego de importar se debe ejecutar `SET search_path TO public;` y luego `\dt`).*
