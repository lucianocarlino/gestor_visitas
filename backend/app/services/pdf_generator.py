"""
PDF Generator Service for Sinclair Technical Visit Reports (RF02, RF20).
Generates official Sinclair Parte de Servicio PDF reports matching the frontend layout
and manages their local file persistence and ZIP archiving.
"""

import base64
import io
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, List, Optional, Set, Union
import zipfile

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image

from app.db.config import PDF_STORAGE_DIR
from app.schemas.domain import CodigoResolucion, CreateVisitDTO, ItemEstructura, Visita

# Color Constants
HEADER_GRAY = Color(220 / 255.0, 220 / 255.0, 220 / 255.0)
HIGHLIGHT_YELLOW = Color(255 / 255.0, 235 / 255.0, 59 / 255.0)
SINCLAIR_BLUE = Color(0 / 255.0, 89 / 255.0, 153 / 255.0)
BLACK = Color(0, 0, 0)
DARK_TEXT = Color(20 / 255.0, 20 / 255.0, 20 / 255.0)

MOTIVO_OPTIONS = [
    {"label": "RUTINA", "code": "SRT", "value": "Rutina"},
    {"label": "PRETEMPORADA", "code": "SPR", "value": "Pretemporada"},
    {"label": "POSTEMPORADA", "code": "SPO", "value": "Postemporada"},
    {"label": "REVISIÓN", "code": "SOH", "value": "Revision"},
    {"label": "EMERGENCIA", "code": "UEM", "value": "Emergencia"},
    {"label": "INSTALACIÓN", "code": "UIN", "value": "Instalacion"},
    {"label": "RETIRADA", "code": "URM", "value": "Retirada"},
    {"label": "ACTUALIZACIÓN", "code": "UUP", "value": "Actualizacion"},
]

ORIGEN_OPTIONS = [
    {"label": "CLIENTE/OPERADOR", "code": "CTR", "value": "Cliente/Operador"},
    {"label": "CALIBRADOR", "code": "SZR", "value": "Calibrador"},
    {"label": "CONDICIÓN DE LA FRUTA", "code": "FC", "value": "Condición de fruta"},
    {"label": "EQUIPO DENTRO DE ESPECIFICACIONES", "code": "EWS", "value": "Equipo dentro de especificaciones"},
    {"label": "FALLO DE LOS COMPONENTES", "code": "CF", "value": "Fallo de los componentes"},
    {"label": "AJUSTE NECESARIO", "code": "ADJ", "value": "Ajuste necesario"},
    {"label": "PROBLEMA CON LAS ETIQUETAS", "code": "LF", "value": "Problema con las etiquetas"},
    {"label": "RECEPCIÓN/ALMACENAJE DE ETIQUETAS", "code": "LDM", "value": "Recepcion/Alamcenaje de etiquetas"},
    {"label": "DAÑO FÍSICO", "code": "PD", "value": "Daño fisico"},
]

TIPO_SERVICIO_OPTIONS = [
    {"label": "EN EMPLAZAMIENTO", "code": "Y", "value": "En emplazamiento"},
    {"label": "TALLER", "code": "X", "value": "Taller"},
    {"label": "FORMACIÓN", "code": "T", "value": "Formacion"},
]

SINCLAIR_LOGO_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAC+ZpjcAAAg1klEQVR4Xu3dO+7jSnYH4MbAzgwY8A68EoeTDzAL"
    "aCWTeB3GAHZkoxuT38TBLOTCgSMD9hpmE2MVRepPlSiJpM7hS98HHNy+/ZBKZD1+LFLd374BAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAADg+/t//td//Jvv//5PpX7z/ccfmnr+8WOpb99//HKpn79+/ffnX9r/dtX+//XXmx93r9FU+7rlPcr7"
    "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"
    "rkJggg=="
)


def get_motivo_code(val: Any) -> str:
    if not val:
        return ""
    s = str(val).strip()
    for opt in MOTIVO_OPTIONS:
        if opt["code"].upper() == s.upper():
            return opt["code"]
    for opt in MOTIVO_OPTIONS:
        if opt["value"].lower() == s.lower() or opt["label"].lower() == s.lower():
            return opt["code"]
    prefix = re.split(r"[\s-]", s)[0]
    for opt in MOTIVO_OPTIONS:
        if opt["code"].upper() == prefix.upper():
            return opt["code"]
    return s


def get_resolucion_code(val: Any) -> str:
    if not val:
        return ""
    if isinstance(val, CodigoResolucion):
        return val.name.lstrip("_")
    s = str(val).strip()
    clean_s = s.lstrip("_")
    if s in CodigoResolucion.__members__:
        return s.lstrip("_")
    if f"_{clean_s}" in CodigoResolucion.__members__:
        return clean_s
    for member in CodigoResolucion:
        if member.value.lower() == s.lower() or member.name.lstrip("_").upper() == clean_s.upper():
            return member.name.lstrip("_")
    prefix = re.split(r"[\s-]", s)[0].lstrip("_")
    if prefix in CodigoResolucion.__members__:
        return prefix
    if f"_{prefix}" in CodigoResolucion.__members__:
        return prefix
    return clean_s


def get_motivo_codes_list(val: Any) -> List[str]:
    if not val:
        return []
    if isinstance(val, (list, set, tuple)):
        raw_items = list(val)
    elif isinstance(val, str):
        raw_items = [part.strip() for part in val.split(",") if part.strip()]
    else:
        raw_items = [val]
    codes = [get_motivo_code(item) for item in raw_items]
    return [c for c in codes if c]


def get_origen_code(val: Any) -> str:
    if not val:
        return ""
    s = str(val).strip()
    for opt in ORIGEN_OPTIONS:
        if opt["code"].upper() == s.upper():
            return opt["code"]
    for opt in ORIGEN_OPTIONS:
        if opt["value"].lower() == s.lower() or opt["label"].lower() == s.lower():
            return opt["code"]
    prefix = re.split(r"[\s-]", s)[0]
    for opt in ORIGEN_OPTIONS:
        if opt["code"].upper() == prefix.upper():
            return opt["code"]
    return s


def format_to_24h(val: Any) -> str:
    """Formats any time string, ISO datetime, or datetime object into strictly 24-hour HH:mm format."""
    if not val:
        return ""
    if isinstance(val, datetime):
        return val.strftime("%H:%M")
    s = str(val).strip()
    if not s:
        return ""
    ampm = re.search(r"(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)", s, re.IGNORECASE)
    if ampm:
        h = int(ampm.group(1))
        m = ampm.group(2)
        is_pm = ampm.group(3).lower() == "pm"
        if is_pm and h < 12:
            h += 12
        elif not is_pm and h == 12:
            h = 0
        return f"{h:02d}:{m}"
    if "T" in s:
        s = s.split("T")[1]
    elif " " in s:
        s = s.split()[1]
    m = re.search(r"(\d{1,2}):(\d{2})", s)
    if m:
        return f"{int(m.group(1)):02d}:{m.group(2)}"
    return s


def format_report_date(date_val: Any) -> str:
    """Formats a date value into DD/MM/YYYY."""
    if not date_val:
        return datetime.now().strftime("%d/%m/%Y")
    if isinstance(date_val, datetime):
        return date_val.strftime("%d/%m/%Y")
    s = str(date_val).strip()
    if not s:
        return datetime.now().strftime("%d/%m/%Y")
    clean = s.split("T")[0].split()[0]
    parts = re.split(r"[-/]", clean)
    if len(parts) == 3:
        if len(parts[0]) == 4:
            return f"{int(parts[2]):02d}/{int(parts[1]):02d}/{parts[0]}"
        return clean
    return s


def y_coord(y_mm: float, height_mm: float = 0) -> float:
    """Converts top-relative millimeters to ReportLab bottom-relative points."""
    return (297.0 - y_mm - height_mm) * mm


def draw_labeled_field(
    c: canvas.Canvas,
    x_mm: float,
    y_mm: float,
    w_mm: float,
    h_mm: float,
    label: str,
    value: str,
    font_size: float = 6.5,
) -> None:
    x_pt = x_mm * mm
    y_pt = y_coord(y_mm, h_mm)
    w_pt = w_mm * mm
    h_pt = h_mm * mm

    c.setStrokeColor(BLACK)
    c.setLineWidth(0.2)
    c.rect(x_pt, y_pt, w_pt, h_pt, fill=0, stroke=1)

    # Label
    c.setFont("Helvetica-Bold", 4.8)
    c.setFillColor(BLACK)
    c.drawString(x_pt + 1.2 * mm, y_pt + h_pt - 2.5 * mm, label)

    # Value
    c.setFont("Helvetica", font_size)
    c.setFillColor(DARK_TEXT)
    # Truncate / wrap value if too long
    val_str = str(value or "")
    if len(val_str) > 45:
        val_str = val_str[:42] + "..."
    c.drawString(x_pt + 1.2 * mm, y_pt + 1.8 * mm, val_str)


def generate_visit_pdf(
    visit: Union[CreateVisitDTO, Visita],
    report_number: Optional[Union[int, str]] = None,
    tecnicos_names: Optional[List[str]] = None,
    empaque_name: Optional[str] = None,
) -> bytes:
    """Generates the technical visit report PDF in memory matching official Sinclair Parte de Servicio format."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    page_x = 8.0
    page_y = 8.0
    page_w = 194.0
    page_h = 281.0

    # Outer Boundary
    c.setStrokeColor(BLACK)
    c.setLineWidth(0.3)
    c.rect(page_x * mm, y_coord(page_y, page_h), page_w * mm, page_h * mm, fill=0, stroke=1)

    # 1. Header Section
    header_h = 18.0
    fsr_w = 50.0
    left_w = page_w - fsr_w
    logo_area_w = 46.0

    c.setLineWidth(0.25)
    c.rect(page_x * mm, y_coord(page_y, header_h), left_w * mm, header_h * mm, fill=0, stroke=1)
    c.rect((page_x + left_w) * mm, y_coord(page_y, header_h), fsr_w * mm, header_h * mm, fill=0, stroke=1)

    # Embed Sinclair Logo
    try:
        logo_bytes = base64.b64decode(SINCLAIR_LOGO_BASE64)
        logo_img = ImageReader(io.BytesIO(logo_bytes))
        img_w = 42.0
        img_h = 13.5
        pos_x = page_x + 1.5 + (logo_area_w - img_w) / 2.0
        pos_y = page_y + (header_h - img_h) / 2.0
        c.drawImage(logo_img, pos_x * mm, y_coord(pos_y, img_h), width=img_w * mm, height=img_h * mm, mask="auto")
    except Exception:
        c.setFont("Helvetica-Bold", 15)
        c.setFillColor(SINCLAIR_BLUE)
        c.drawString((page_x + 4) * mm, y_coord(page_y + 11.5), "Sinclair.")

    # Header Title
    c.setFont("Helvetica-Bold", 14.5)
    c.setFillColor(BLACK)
    title_center_x = page_x + logo_area_w + (left_w - logo_area_w) / 2.0
    c.drawCentredString(title_center_x * mm, y_coord(page_y + 11.5), "PARTE DE SERVICIO")

    # FSR # Box
    display_num = str(report_number or (getattr(visit, "reporte", None) and getattr(visit.reporte, "numero", "")) or getattr(visit, "id", "") or "")
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(BLACK)
    c.drawString((page_x + left_w + 2.5) * mm, y_coord(page_y + 11.5), "FSR #")
    c.setFont("Helvetica-Bold", 11 if len(display_num) > 8 else 13)
    c.setFillColor(SINCLAIR_BLUE)
    c.drawString((page_x + left_w + 16.5) * mm, y_coord(page_y + 11.5), display_num)

    current_y = page_y + header_h

    # 2. Main Field Rows
    row_h = 8.5
    w_llamada = 44.0
    w_comienzo = 44.0
    w_cliente = w_llamada + w_comienzo  # 88 mm
    w_fin = 44.0
    w_fuera_de = 38.0
    w_ubicacion = w_fin + w_fuera_de  # 82 mm
    w_fecha = page_w - w_cliente - w_ubicacion  # 24 mm
    w_si_no = w_fecha / 2.0

    nombre_cliente = getattr(visit, "nombre_cliente", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "nombre_cliente", "")) or ""
    solicitado_por = getattr(visit, "solicitado_por", "") or ""
    fecha_val = getattr(visit, "fecha", "") or datetime.now()
    fecha_display = format_report_date(fecha_val)

    hora_llamada = getattr(visit, "hora_llamada", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "hora_llamada", "")) or ""
    hora_inicio = getattr(visit, "hora_inicio", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "hora_inicio", "")) or ""
    hora_fin = getattr(visit, "hora_fin", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "hora_fin", "")) or ""
    fuera_de_hora = getattr(visit, "fuera_de_hora", False) or (getattr(visit, "reporte", None) and getattr(visit.reporte, "fuera_de_hora", False))

    # Row 1
    draw_labeled_field(c, page_x, current_y, w_cliente, row_h, "NOMBRE DEL CLIENTE:", empaque_name or nombre_cliente)
    draw_labeled_field(c, page_x + w_cliente, current_y, w_ubicacion, row_h, "UBICACIÓN:", solicitado_por)
    draw_labeled_field(c, page_x + w_cliente + w_ubicacion, current_y, w_fecha, row_h, "FECHA:", fecha_display)
    current_y += row_h

    # Row 2 - Format time strictly to 24hs (HH:mm)
    draw_labeled_field(c, page_x, current_y, w_llamada, row_h, "FECHA/HORA LLAMADA RECIBIDA:", format_to_24h(hora_llamada))
    draw_labeled_field(c, page_x + w_llamada, current_y, w_comienzo, row_h, "HORA DE COMIENZO:", format_to_24h(hora_inicio))
    draw_labeled_field(c, page_x + w_llamada + w_comienzo, current_y, w_fin, row_h, "HORA DE FINALIZACIÓN:", format_to_24h(hora_fin))

    fuera_de_x = page_x + w_llamada + w_comienzo + w_fin
    c.rect(fuera_de_x * mm, y_coord(current_y, row_h), w_fuera_de * mm, row_h * mm, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 4.7)
    c.setFillColor(BLACK)
    c.drawString((fuera_de_x + 1.2) * mm, y_coord(current_y + 5.0), "LLAMADA/TRABAJO FUERA DE HORA:")

    yes_no_x = fuera_de_x + w_fuera_de
    c.rect(yes_no_x * mm, y_coord(current_y, row_h), w_si_no * mm, row_h * mm, fill=0, stroke=1)
    c.rect((yes_no_x + w_si_no) * mm, y_coord(current_y, row_h), w_si_no * mm, row_h * mm, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 5.5)
    c.drawCentredString((yes_no_x + w_si_no / 2.0) * mm, y_coord(current_y + 3.2), "SÍ")
    c.drawCentredString((yes_no_x + w_si_no + w_si_no / 2.0) * mm, y_coord(current_y + 3.2), "NO")
    c.setFont("Helvetica-Bold", 8)
    if fuera_de_hora:
        c.drawCentredString((yes_no_x + w_si_no / 2.0) * mm, y_coord(current_y + row_h - 1.2), "X")
    else:
        c.drawCentredString((yes_no_x + w_si_no + w_si_no / 2.0) * mm, y_coord(current_y + row_h - 1.2), "X")
    current_y += row_h

    # Collect Motivo & Origen Codes
    motivos_set: Set[str] = set()
    raw_motivos = getattr(visit, "codigo_motivo", []) or (
        getattr(visit, "reporte", None) and getattr(visit.reporte, "codigo_motivo", [])
    )
    for code in get_motivo_codes_list(raw_motivos):
        motivos_set.add(code)

    origenes_set: Set[str] = set()
    raw_origenes = getattr(visit, "codigo_origen", [])
    if isinstance(raw_origenes, (list, set)):
        for o in raw_origenes:
            code = get_origen_code(o)
            if code:
                origenes_set.add(code)
    elif raw_origenes:
        origenes_set.add(get_origen_code(raw_origenes))

    estructura_list = getattr(visit, "estructura", []) or (getattr(visit, "reporte", None) and getattr(visit.reporte, "estructura", [])) or []
    for item in estructura_list:
        for m_code in get_motivo_codes_list(getattr(item, "codigo_motivo", None)):
            motivos_set.add(m_code)
        o_code = get_origen_code(getattr(item, "codigo_origen", None))
        if o_code:
            origenes_set.add(o_code)

    raw_tipo = getattr(visit, "codigo_tipo_servicio", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "codigo_tipo_servicio", "")) or ""
    selected_tipo = str(raw_tipo.value if hasattr(raw_tipo, "value") else raw_tipo)

    # 3. Códigos del Motivo & Tipo de Servicio
    motive_block_h = 20.0
    motive_w = 124.0
    tipo_w = page_w - motive_w

    c.rect(page_x * mm, y_coord(current_y, motive_block_h), motive_w * mm, motive_block_h * mm, fill=0, stroke=1)
    c.rect((page_x + motive_w) * mm, y_coord(current_y, motive_block_h), tipo_w * mm, motive_block_h * mm, fill=0, stroke=1)

    # Header strips
    c.setFillColor(HEADER_GRAY)
    c.rect(page_x * mm, y_coord(current_y, 4.0), motive_w * mm, 4.0 * mm, fill=1, stroke=1)
    c.rect((page_x + motive_w) * mm, y_coord(current_y, 4.0), tipo_w * mm, 4.0 * mm, fill=1, stroke=1)

    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(BLACK)
    c.drawCentredString((page_x + motive_w / 2.0) * mm, y_coord(current_y + 2.9), "CÓDIGOS DEL MOTIVO")
    c.drawCentredString((page_x + motive_w + (tipo_w - 14) / 2.0) * mm, y_coord(current_y + 2.9), "TIPO DE SERVICIO")
    c.drawCentredString((page_x + page_w - 7.0) * mm, y_coord(current_y + 2.9), "CÓDIGOS")

    motive_row_h = (motive_block_h - 4.0) / 4.0
    half_motive_w = motive_w / 2.0
    code_box_w = 13.0

    for i in range(4):
        row_top = current_y + 4.0 + i * motive_row_h
        c.setStrokeColor(BLACK)
        c.line(page_x * mm, y_coord(row_top), (page_x + motive_w) * mm, y_coord(row_top))
        c.line((page_x + half_motive_w) * mm, y_coord(row_top), (page_x + half_motive_w) * mm, y_coord(row_top + motive_row_h))

        # Left item
        left_item = MOTIVO_OPTIONS[i]
        c.setFont("Helvetica-Bold", 4.8)
        c.setFillColor(BLACK)
        c.drawString((page_x + 1.5) * mm, y_coord(row_top + motive_row_h - 1.2), left_item["label"])

        left_code_box_x = page_x + half_motive_w - code_box_w
        is_left_sel = left_item["code"] in motivos_set
        if is_left_sel:
            c.setFillColor(HIGHLIGHT_YELLOW)
            c.rect(left_code_box_x * mm, y_coord(row_top, motive_row_h), code_box_w * mm, motive_row_h * mm, fill=1, stroke=1)
        else:
            c.rect(left_code_box_x * mm, y_coord(row_top, motive_row_h), code_box_w * mm, motive_row_h * mm, fill=0, stroke=1)
        c.setFont("Helvetica-Bold" if is_left_sel else "Helvetica", 5.2)
        c.setFillColor(BLACK)
        c.drawCentredString((left_code_box_x + code_box_w / 2.0) * mm, y_coord(row_top + motive_row_h - 1.2), left_item["code"])

        # Right item
        right_item = MOTIVO_OPTIONS[i + 4]
        c.setFont("Helvetica-Bold", 4.8)
        c.drawString((page_x + half_motive_w + 1.5) * mm, y_coord(row_top + motive_row_h - 1.2), right_item["label"])

        right_code_box_x = page_x + motive_w - code_box_w
        is_right_sel = right_item["code"] in motivos_set
        if is_right_sel:
            c.setFillColor(HIGHLIGHT_YELLOW)
            c.rect(right_code_box_x * mm, y_coord(row_top, motive_row_h), code_box_w * mm, motive_row_h * mm, fill=1, stroke=1)
        else:
            c.rect(right_code_box_x * mm, y_coord(row_top, motive_row_h), code_box_w * mm, motive_row_h * mm, fill=0, stroke=1)
        c.setFont("Helvetica-Bold" if is_right_sel else "Helvetica", 5.2)
        c.setFillColor(BLACK)
        c.drawCentredString((right_code_box_x + code_box_w / 2.0) * mm, y_coord(row_top + motive_row_h - 1.2), right_item["code"])

    # Tipo de Servicio
    tipo_row_h = (motive_block_h - 4.0) / 4.0
    tipo_code_box_w = 14.0
    for i in range(4):
        row_top = current_y + 4.0 + i * tipo_row_h
        c.setStrokeColor(BLACK)
        c.line((page_x + motive_w) * mm, y_coord(row_top), (page_x + page_w) * mm, y_coord(row_top))
        tipo_code_box_x = page_x + page_w - tipo_code_box_w

        if i < len(TIPO_SERVICIO_OPTIONS):
            item = TIPO_SERVICIO_OPTIONS[i]
            c.setFont("Helvetica-Bold", 4.8)
            c.setFillColor(BLACK)
            c.drawString((page_x + motive_w + 1.5) * mm, y_coord(row_top + tipo_row_h - 1.2), item["label"])

            is_tipo_sel = selected_tipo == item["code"] or selected_tipo.lower() == item["value"].lower()
            if is_tipo_sel:
                c.setFillColor(HIGHLIGHT_YELLOW)
                c.rect(tipo_code_box_x * mm, y_coord(row_top, tipo_row_h), tipo_code_box_w * mm, tipo_row_h * mm, fill=1, stroke=1)
            else:
                c.rect(tipo_code_box_x * mm, y_coord(row_top, tipo_row_h), tipo_code_box_w * mm, tipo_row_h * mm, fill=0, stroke=1)
            c.setFont("Helvetica-Bold" if is_tipo_sel else "Helvetica", 5.2)
            c.setFillColor(BLACK)
            c.drawCentredString((tipo_code_box_x + tipo_code_box_w / 2.0) * mm, y_coord(row_top + tipo_row_h - 1.2), item["code"])
        else:
            c.rect(tipo_code_box_x * mm, y_coord(row_top, tipo_row_h), tipo_code_box_w * mm, tipo_row_h * mm, fill=0, stroke=1)

    current_y += motive_block_h

    # 4. Códigos de Origen
    origen_rows = 3
    origen_cols = 3
    origen_header = 4.0
    origen_row_h = 4.0
    origen_block_h = origen_header + origen_rows * origen_row_h

    c.rect(page_x * mm, y_coord(current_y, origen_block_h), page_w * mm, origen_block_h * mm, fill=0, stroke=1)
    c.setFillColor(HEADER_GRAY)
    c.rect(page_x * mm, y_coord(current_y, origen_header), page_w * mm, origen_header * mm, fill=1, stroke=1)

    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(BLACK)
    c.drawCentredString((page_x + page_w / 2.0) * mm, y_coord(current_y + 2.9), "CÓDIGOS DE ORIGEN")

    origen_col_w = page_w / origen_cols
    origen_code_box_w = 12.5

    c.setStrokeColor(BLACK)
    for col in range(1, origen_cols):
        c.line((page_x + col * origen_col_w) * mm, y_coord(current_y + origen_header), (page_x + col * origen_col_w) * mm, y_coord(current_y + origen_block_h))
    for r in range(origen_rows + 1):
        top = current_y + origen_header + r * origen_row_h
        c.line(page_x * mm, y_coord(top), (page_x + page_w) * mm, y_coord(top))

    for i, item in enumerate(ORIGEN_OPTIONS):
        col = i % origen_cols
        row = i // origen_cols
        cell_x = page_x + col * origen_col_w
        cell_y = current_y + origen_header + row * origen_row_h

        c.setFont("Helvetica-Bold", 4.8)
        c.setFillColor(BLACK)
        c.drawString((cell_x + 1.5) * mm, y_coord(cell_y + origen_row_h - 1.2), item["label"])

        code_box_x = cell_x + origen_col_w - origen_code_box_w
        is_origen_sel = item["code"] in origenes_set
        if is_origen_sel:
            c.setFillColor(HIGHLIGHT_YELLOW)
            c.rect(code_box_x * mm, y_coord(cell_y, origen_row_h), origen_code_box_w * mm, origen_row_h * mm, fill=1, stroke=1)
        else:
            c.rect(code_box_x * mm, y_coord(cell_y, origen_row_h), origen_code_box_w * mm, origen_row_h * mm, fill=0, stroke=1)
        c.setFont("Helvetica-Bold" if is_origen_sel else "Helvetica", 5.2)
        c.setFillColor(BLACK)
        c.drawCentredString((code_box_x + origen_code_box_w / 2.0) * mm, y_coord(cell_y + origen_row_h - 1.2), item["code"])

    current_y += origen_block_h

    # 5. Producción Etiquetada & Condición de la Fruta
    context_row_h = 7.5
    half_context_w = page_w / 2.0
    prod_etiq = getattr(visit, "produccion_etiquetada", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "produccion_etiquetada", "")) or ""
    cond_fruta = getattr(visit, "condicion_fruta", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "condicion_fruta", "")) or ""
    draw_labeled_field(c, page_x, current_y, half_context_w, context_row_h, "PRODUCCIÓN ETIQUETADA:", str(prod_etiq))
    draw_labeled_field(c, page_x + half_context_w, current_y, half_context_w, context_row_h, "CONDICIÓN DE LA FRUTA:", str(cond_fruta))
    current_y += context_row_h

    # 6. Instruction Banner
    instruction_h = 7.0
    c.rect(page_x * mm, y_coord(current_y, instruction_h), page_w * mm, instruction_h * mm, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 4.4)
    c.setFillColor(BLACK)
    c.drawString((page_x + 1.5) * mm, y_coord(current_y + 2.6), "NOTA: CÓDIGO DE ORIGEN Y CÓDIGOS DE RESOLUCIÓN CORRESPONDIENTES. ANOTE CUALQUIER OTRA ACCIÓN DIRIGIDA A DEVOLVER AL EQUIPO UNOS")
    c.drawString((page_x + 1.5) * mm, y_coord(current_y + 5.4), "PARÁMETROS DE FUNCIONAMIENTO ÓPTIMOS, FIRME EL INFORME INDICANDO LOS PROCEDIMIENTOS APLICADOS PARA COMPLETAR EL TRABAJO.")
    current_y += instruction_h

    # 7. Main Service Detail Table
    detail_top = current_y
    detail_h = 104.0
    head_h = 13.0
    c.rect(page_x * mm, y_coord(detail_top, detail_h), page_w * mm, detail_h * mm, fill=0, stroke=1)

    # Header background
    c.setFillColor(HEADER_GRAY)
    c.rect(page_x * mm, y_coord(detail_top, head_h), page_w * mm, head_h * mm, fill=1, stroke=1)

    col_widths = [16.0, 12.0, 18.0, 12.0, 42.0, 11.0, 43.0, 13.0, 13.0, 14.0]
    headers_text = [
        ("NÚMERO DE", "SERIE"),
        ("CÓD.", "MOTIVO"),
        ("CÓDIGO DE ORIGEN", "O DE LA RES."),
        ("FIN/RES", ""),
        ("N/PARTES O PIEZAS", "SUSTITUIDAS O AJUSTADAS"),
        ("CANTIDAD", ""),
        ("ACCIONES REALIZADAS PARA", "OPTIMIZAR EL SERVICIO"),
    ]

    curr_x = page_x
    c.setFont("Helvetica-Bold", 4.1)
    c.setFillColor(BLACK)
    c.setStrokeColor(BLACK)

    for i in range(7):
        c.line(curr_x * mm, y_coord(detail_top), curr_x * mm, y_coord(detail_top + head_h))
        l1, l2 = headers_text[i]
        if not l2:
            c.drawCentredString((curr_x + col_widths[i] / 2.0) * mm, y_coord(detail_top + 7.0), l1)
        else:
            c.drawCentredString((curr_x + col_widths[i] / 2.0) * mm, y_coord(detail_top + 5.0), l1)
            c.drawCentredString((curr_x + col_widths[i] / 2.0) * mm, y_coord(detail_top + 9.0), l2)
        curr_x += col_widths[i]

    # PCTJE ETIQ Unified Header
    pct_start_x = curr_x
    pct_total_w = col_widths[7] + col_widths[8]
    c.line(pct_start_x * mm, y_coord(detail_top), pct_start_x * mm, y_coord(detail_top + head_h))
    c.drawCentredString((pct_start_x + pct_total_w / 2.0) * mm, y_coord(detail_top + 4.5), "PCTJE ETIQ.")
    c.line(pct_start_x * mm, y_coord(detail_top + 6.5), (pct_start_x + pct_total_w) * mm, y_coord(detail_top + 6.5))
    c.line((pct_start_x + col_widths[7]) * mm, y_coord(detail_top + 6.5), (pct_start_x + col_widths[7]) * mm, y_coord(detail_top + head_h))
    c.setFont("Helvetica-Bold", 3.8)
    c.drawCentredString((pct_start_x + col_widths[7] / 2.0) * mm, y_coord(detail_top + 10.8), "(75%)")
    c.drawCentredString((pct_start_x + col_widths[7] + col_widths[8] / 2.0) * mm, y_coord(detail_top + 10.8), "REAL")

    curr_x += pct_total_w

    # Last column: TIEMPO DE SERVICIO
    c.line(curr_x * mm, y_coord(detail_top), curr_x * mm, y_coord(detail_top + head_h))
    c.setFont("Helvetica-Bold", 4.1)
    c.drawCentredString((curr_x + col_widths[9] / 2.0) * mm, y_coord(detail_top + 5.0), "TIEMPO DE")
    c.drawCentredString((curr_x + col_widths[9] / 2.0) * mm, y_coord(detail_top + 9.0), "SERVICIO")

    c.line(page_x * mm, y_coord(detail_top + head_h), (page_x + page_w) * mm, y_coord(detail_top + head_h))

    # Grid Body
    row_count = 13
    detail_row_h = (detail_h - head_h) / row_count

    col_acc_x = page_x
    for w in col_widths:
        c.line(col_acc_x * mm, y_coord(detail_top + head_h), col_acc_x * mm, y_coord(detail_top + detail_h))
        col_acc_x += w

    for r in range(1, row_count + 1):
        top_line = detail_top + head_h + r * detail_row_h
        c.line(page_x * mm, y_coord(top_line), (page_x + page_w) * mm, y_coord(top_line))

    # Populate rows
    c.setFont("Helvetica-Bold", 5.2)
    c.setFillColor(DARK_TEXT)
    items_to_draw = estructura_list[:row_count]

    for row_idx, item in enumerate(items_to_draw):
        row_y = detail_top + head_h + row_idx * detail_row_h + 4.8
        pct_esp = getattr(item, "pct_etiquetado_esperado", None)
        pct_esp_str = f"{pct_esp}%" if pct_esp is not None and str(pct_esp) != "" else ""
        pct_real = getattr(item, "pct_etiquetado_real", None)
        pct_real_str = f"{pct_real}%" if pct_real is not None and str(pct_real) != "" else ""
        t_serv = getattr(item, "tiempo_servicio", None)
        t_serv_str = f"{t_serv} min" if t_serv is not None and str(t_serv) != "" else ""

        short_mot = ", ".join(get_motivo_codes_list(getattr(item, "codigo_motivo", "")))
        short_ori = get_origen_code(getattr(item, "codigo_origen", ""))
        short_res = get_resolucion_code(getattr(item, "codigo_res", ""))

        row_vals = [
            str(getattr(item, "numero_de_serie", "") or ""),
            short_mot,
            short_ori,
            short_res,
            str(getattr(item, "numero_partes", "") or ""),
            str(getattr(item, "cantidad", "") or ""),
            str(getattr(item, "otras_acciones", "") or ""),
            pct_esp_str,
            pct_real_str,
            t_serv_str,
        ]

        vx = page_x
        for col_i, text_val in enumerate(row_vals):
            c.drawCentredString((vx + col_widths[col_i] / 2.0) * mm, y_coord(row_y), text_val)
            vx += col_widths[col_i]

    current_y += detail_h

    # 8. Comments & Observations
    comments_h = 17.5
    comentarios = getattr(visit, "comentarios", "") or (getattr(visit, "reporte", None) and getattr(visit.reporte, "comentarios", "")) or ""
    c.rect(page_x * mm, y_coord(current_y, comments_h), page_w * mm, comments_h * mm, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(BLACK)
    c.drawString((page_x + 1.5) * mm, y_coord(current_y + 3.8), "COMENTARIOS:")
    c.setFont("Helvetica", 5.5)
    c.setFillColor(DARK_TEXT)
    # Simple line-splitting for comments
    com_lines = str(comentarios).split("\n")
    com_y = current_y + 7.5
    for cline in com_lines[:3]:
        c.drawString((page_x + 1.5) * mm, y_coord(com_y), cline[:140])
        com_y += 3.5
    current_y += comments_h

    # 9. Checklist Statement
    check_total_h = 13.5
    gray_band_h = 4.2
    c.rect(page_x * mm, y_coord(current_y, check_total_h), page_w * mm, check_total_h * mm, fill=0, stroke=1)
    c.setFillColor(HEADER_GRAY)
    c.rect(page_x * mm, y_coord(current_y, gray_band_h), page_w * mm, gray_band_h * mm, fill=1, stroke=1)
    c.rect(page_x * mm, y_coord(current_y + check_total_h - gray_band_h, gray_band_h), page_w * mm, gray_band_h * mm, fill=1, stroke=1)

    mid_y = current_y + gray_band_h
    mid_h = check_total_h - 2.0 * gray_band_h
    c.rect((page_x + 1.5) * mm, y_coord(mid_y + (mid_h - 3.8) / 2.0, 3.8), 3.8 * mm, 3.8 * mm, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(BLACK)
    c.drawCentredString((page_x + 3.4) * mm, y_coord(mid_y + mid_h / 2.0 + 1.1), "X")

    c.setFont("Helvetica-Bold", 4.8)
    c.drawString((page_x + 7.0) * mm, y_coord(mid_y + mid_h / 2.0 + 1.1), "HE REALIZADO UN SERVICIO DE ACUERDO CON LOS PROCEDIMIENTOS / LISTA DE TAREAS CORRESPONDIENTES")
    current_y += check_total_h

    # 10. Signatures Section
    sign_h = 17.0
    half_sign_w = page_w / 2.0
    c.rect(page_x * mm, y_coord(current_y, sign_h), page_w * mm, sign_h * mm, fill=0, stroke=1)
    c.line((page_x + half_sign_w) * mm, y_coord(current_y), (page_x + half_sign_w) * mm, y_coord(current_y + sign_h))
    c.line(page_x * mm, y_coord(current_y + sign_h / 2.0), (page_x + page_w) * mm, y_coord(current_y + sign_h / 2.0))

    # Left (Técnico)
    c.setFont("Helvetica-Bold", 5.5)
    c.setFillColor(BLACK)
    c.drawString((page_x + 1.5) * mm, y_coord(current_y + 3.5), "FIRMA DEL TÉCNICO:")
    c.drawString((page_x + 1.5) * mm, y_coord(current_y + sign_h / 2.0 + 3.5), "EN LETRAS DE IMPRENTA:")
    c.setFont("Helvetica", 6.0)
    tec_str = ", ".join(tecnicos_names) if tecnicos_names else ""
    c.drawString((page_x + 36.0) * mm, y_coord(current_y + sign_h / 2.0 + 3.5), tec_str)

    # Right (Cliente)
    c.setFont("Helvetica-Bold", 5.5)
    c.drawString((page_x + half_sign_w + 1.5) * mm, y_coord(current_y + 3.5), "FIRMA DEL CLIENTE:")

    # Customer Digital Signature Image
    firma_cliente = getattr(visit, "firma_cliente", None) or (getattr(visit, "reporte", None) and getattr(visit.reporte, "firma_cliente", None))
    if firma_cliente and str(firma_cliente).startswith("data:image/"):
        try:
            base64_data = str(firma_cliente).split(",")[-1]
            sig_bytes = base64.b64decode(base64_data)
            sig_img = ImageReader(io.BytesIO(sig_bytes))
            c.drawImage(
                sig_img,
                (page_x + half_sign_w + 32.0) * mm,
                y_coord(current_y + 1.0, sign_h / 2.0 - 2.0),
                width=38.0 * mm,
                height=(sign_h / 2.0 - 2.0) * mm,
                mask="auto",
            )
        except Exception as err:
            print(f"Error embedding customer signature: {err}")

    c.setFont("Helvetica-Bold", 5.5)
    c.drawString((page_x + half_sign_w + 1.5) * mm, y_coord(current_y + sign_h / 2.0 + 3.5), "EN LETRAS DE IMPRENTA:")
    c.setFont("Helvetica", 6.0)
    c.drawString((page_x + half_sign_w + 36.0) * mm, y_coord(current_y + sign_h / 2.0 + 3.5), nombre_cliente)

    c.showPage()
    c.save()

    return buffer.getvalue()


def save_visit_pdf(
    visit: Union[CreateVisitDTO, Visita],
    report_number: Optional[Union[int, str]] = None,
    tecnicos_names: Optional[List[str]] = None,
    empaque_name: Optional[str] = None,
    output_dir: Optional[Union[Path, str]] = None,
) -> Path:
    """Generates and saves a visit PDF to the configured disk directory."""
    target_dir = Path(output_dir or PDF_STORAGE_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)

    pdf_bytes = generate_visit_pdf(
        visit=visit,
        report_number=report_number,
        tecnicos_names=tecnicos_names,
        empaque_name=empaque_name,
    )

    clean_emp = re.sub(r"[^a-zA-Z0-9_-]", "_", empaque_name or "Empaque")[:20]
    num_str = str(report_number or (getattr(visit, "reporte", None) and getattr(visit.reporte, "numero", "")) or getattr(visit, "id", "") or "0")
    fecha_str = str(getattr(visit, "fecha", "") or datetime.now().strftime("%Y-%m-%d")).split("T")[0]

    filename = f"Reporte_Sinclair_{num_str}_{clean_emp}_{fecha_str}.pdf"
    file_path = target_dir / filename
    file_path.write_bytes(pdf_bytes)

    return file_path


def create_visits_zip(
    visits: List[Visita],
    output_dir: Optional[Union[Path, str]] = None,
) -> bytes:
    """Generates a ZIP archive containing all PDF reports and an index CSV manifest."""
    target_dir = Path(output_dir or PDF_STORAGE_DIR)
    target_dir.mkdir(parents=True, exist_ok=True)

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for v in visits:
            report_num = v.reporte.numero if v.reporte else v.id
            emp_name = v.empaque.nombre if v.empaque else "Planta"
            clean_emp = re.sub(r"[^a-zA-Z0-9_-]", "_", emp_name)[:20]
            fecha_str = str(v.fecha).split("T")[0]
            pdf_filename = f"Reporte_{report_num}_{clean_emp}_{fecha_str}.pdf"

            # Check if file exists on disk, otherwise generate on the fly
            disk_path = target_dir / f"Reporte_Sinclair_{report_num}_{clean_emp}_{fecha_str}.pdf"
            if disk_path.exists():
                pdf_data = disk_path.read_bytes()
            else:
                tec_names = [t.nombre for t in v.tecnicos] if v.tecnicos else []
                pdf_data = generate_visit_pdf(
                    visit=v,
                    report_number=report_num,
                    tecnicos_names=tec_names,
                    empaque_name=emp_name,
                )
                # Cache it to disk
                disk_path.write_bytes(pdf_data)

            zip_file.writestr(f"Reportes_Sinclair_PDF/{pdf_filename}", pdf_data)

        # CSV summary manifest
        manifest_lines = [
            "RESUMEN DE REPORTES DE VISITAS - SINCLAIR SYSTEMS INTERNATIONAL",
            f"Fecha de exportacion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Total de reportes incluidos: {len(visits)}",
            "",
            "NUMERO,FECHA,EMPAQUE,TECNICOS,HORARIO,ESTADO",
        ]
        for v in visits:
            rep_num = v.reporte.numero if v.reporte else ""
            emp = v.empaque.nombre if v.empaque else "Planta"
            tec_str = " & ".join(t.nombre for t in v.tecnicos) if v.tecnicos else ""
            h_ini = v.reporte.hora_inicio if v.reporte else ""
            h_fin = v.reporte.hora_fin if v.reporte else ""
            sync_st = v.estado_sincronizacion or "synced"
            manifest_lines.append(f'{rep_num},"{v.fecha}","{emp}","{tec_str}","{format_to_24h(h_ini)}-{format_to_24h(h_fin)}","{sync_st}"')

        zip_file.writestr("Reportes_Sinclair_PDF/indice_reportes.csv", "\n".join(manifest_lines))

    return zip_buffer.getvalue()
