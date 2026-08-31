Lector de PDFs (Python)
=======================

Este pequeño proyecto permite extraer texto de archivos PDF usando Python.

Requisitos
---------
- Python 3.8+
- Instalar dependencias:

En PowerShell (Windows):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; python -m pip install -r "C:\Users\User\OneDrive - frt.utn.edu.ar\CyC\Horas\requirements.txt"
```

Notas sobre OCR
---------------
Si el PDF está escaneado (imagenes), deberá instalar Tesseract para Windows:
- Descargar el instalador de: https://github.com/tesseract-ocr/tesseract
- Asegúrese de que el ejecutable `tesseract.exe` esté en el PATH.

Uso
----
Ejemplos:

```powershell
# Imprimir texto del PDF
python .\main.py .\data\carlino-- psr-1AvEM-2026-05-08-04-00-08.pdf

# Guardar salida en archivo (single o batch si path es carpeta)
python .\main.py .\data --out .\salida\ --ocr

# Forzar OCR (si extracción directa no funciona)
python .\main.py .\data\archivo.pdf --ocr --out resultado.txt
```

Limitaciones
------------
- La extracción de texto depende de la calidad del PDF. PDFs escaneados requieren OCR.
- Para páginas específicas o un control más fino puede ajustar el código.

Si quiere, puedo adaptar el script para generar un único gran archivo de salida o para extraer metadatos adicionales.

