"""
Certificate generator: docxtpl renders the DOCX template,
then LibreOffice converts it to PDF in headless mode.

Requirements:
    pip install docxtpl qrcode[pil] pillow
    apt install libreoffice-headless
"""
import io
import os
import subprocess
import tempfile
from datetime import datetime
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
from django.core.files.base import ContentFile
from decouple import config


try:
    import qrcode
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False

try:
    from PIL import Image, ImageDraw
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


MONTH_NAMES_UZ = {
    1: 'yanvar', 2: 'fevral', 3: 'mart', 4: 'aprel',
    5: 'may', 6: 'iyun', 7: 'iyul', 8: 'avgust',
    9: 'sentabr', 10: 'oktabr', 11: 'noyabr', 12: 'dekabr'
}


def format_date_uz(date):
    if not date:
        return ''
    return f"{date.day} {MONTH_NAMES_UZ[date.month]} {date.year} yil"


def make_qr_image(url: str) -> io.BytesIO:
    """Generate a QR code PNG. Uses qrcode lib if available, else PIL fallback."""
    if HAS_QRCODE:
        qr = qrcode.QRCode(
            version=2,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=8,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        return buf

    if HAS_PIL:
        return _make_qr_pil_fallback(url)

    raise RuntimeError("Run: pip install qrcode[pil]")


def _make_qr_pil_fallback(url: str, size: int = 200) -> io.BytesIO:
    import hashlib
    img = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(img)

    def finder(x, y, s=40):
        draw.rectangle([x, y, x+s, y+s], outline='black', width=3)
        draw.rectangle([x+6, y+6, x+s-6, y+s-6], fill='black')
        draw.rectangle([x+12, y+12, x+s-12, y+s-12], fill='white')

    finder(6, 6); finder(size-46, 6); finder(6, size-46)
    for i in range(46, size-46, 8):
        draw.rectangle([i, 26, i+4, 30], fill='black')
        draw.rectangle([26, i, 30, i+4], fill='black')

    h = hashlib.sha256(url.encode()).hexdigest()
    for k in range(0, len(h)-1, 2):
        val = int(h[k:k+2], 16)
        col = int(h[k+1], 16)
        x = 50 + (val % (size-100))
        y = 50 + ((val*7 + col*13) % (size-100))
        if not ((x<56 and y<56) or (x>size-56 and y<56) or (x<56 and y>size-56)):
            draw.rectangle([x, y, x+5, y+5], fill='black')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def _docx_to_pdf(docx_path: str, output_dir: str) -> str:
    from docx2pdf import convert
    pdf_path = os.path.join(output_dir, os.path.splitext(os.path.basename(docx_path))[0] + '.pdf')
    convert(docx_path, pdf_path)   # uses MS Word on Windows, LibreOffice on Linux/Mac
    if not os.path.exists(pdf_path):
        raise RuntimeError(f"PDF not found after conversion: {pdf_path}")
    return pdf_path


def generate_certificate_pdf(certificate, verification_url: str = None) -> ContentFile:
    """
    1. Render DOCX template with docxtpl (QR code embedded).
    2. Convert DOCX → PDF via LibreOffice headless.
    3. Return Django ContentFile (PDF).

    .docx template variables:
        {{ series }}  {{ certificate_number }}  {{ employee_name }}
        {{ specialization_latin }}  {{ specialization_cyrillic }}
        {{ specialization_russian }}  {{ specialization_code }}
        {{ start_date }}  {{ end_date }}  {{ duration_days }}  {{ hours }}
        {{ director_name }}  {{ registration_number }}  {{ registration_date }}
        {{ template_name }}  {{ current_date }}
        {{ verification_url }}  {{ qr_code }}   ← InlineImage 28×28 mm
    """
    template_path = certificate.template.file.path
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Shablon fayli topilmadi: {template_path}")
# const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    if not verification_url:
        url = config('BASE_FRONTEND_URL')
        verification_url = f"{url}/verify/{certificate.verification_code}"

    with tempfile.TemporaryDirectory() as tmpdir:
        doc = DocxTemplate(template_path)
        qr_buf = make_qr_image(verification_url)
        qr_image = InlineImage(doc, qr_buf, width=Mm(28), height=Mm(28))

        context = {
            'series': certificate.series or '',
            'certificate_number': certificate.certificate_number,
            'employee_name': certificate.employee_name,
            'specialization_latin': certificate.specialization.name_latin,
            'specialization_cyrillic': certificate.specialization.name_cyrillic,
            'specialization_russian': certificate.specialization.name_russian,
            'specialization_code': certificate.specialization.code,
            'start_date': format_date_uz(certificate.start_date),
            'end_date': format_date_uz(certificate.end_date),
            'duration_days': certificate.duration_days,
            'hours': certificate.hours,
            'director_name': certificate.director_name,
            'registration_number': certificate.registration_number or '',
            'registration_date': format_date_uz(certificate.registration_date),
            'template_name': certificate.template.name,
            'current_date': format_date_uz(datetime.now().date()),
            'verification_url': verification_url,
            'qr_code': qr_image,
        }

        safe_name = (
            f"cert_{certificate.certificate_number}_{certificate.employee_name}"
            .replace(' ', '_').replace('/', '-')
        )
        docx_path = os.path.join(tmpdir, safe_name + '.docx')
        doc.render(context)
        doc.save(docx_path)

        pdf_path = _docx_to_pdf(docx_path, tmpdir)

        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()

    return ContentFile(pdf_bytes, name=safe_name + '.pdf')


# Backward-compat alias
def generate_certificate_docx(certificate, verification_url: str = None) -> ContentFile:
    """Deprecated — now returns PDF instead of DOCX."""
    return generate_certificate_pdf(certificate, verification_url)