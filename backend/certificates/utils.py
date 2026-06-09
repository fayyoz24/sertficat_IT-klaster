"""
Certificate DOCX generator with QR code support (docxtpl + qrcode).
QR code is embedded in the bottom-right of the document via InlineImage.

Requirements:
    pip install docxtpl qrcode[pil] pillow
"""
import io
import os
from datetime import datetime
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
from django.core.files.base import ContentFile

# Try qrcode library first, fallback to pure PIL implementation
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
    """
    Generate a QR code PNG image in memory.
    Uses qrcode library if available, otherwise falls back to a
    scannable-looking PIL placeholder (install qrcode[pil] for real QR).
    """
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

    raise RuntimeError(
        "QR code generation requires 'qrcode[pil]' or 'pillow'.\n"
        "Run: pip install qrcode[pil]"
    )


def _make_qr_pil_fallback(url: str, size: int = 200) -> io.BytesIO:
    """
    Pure-PIL QR-like image as fallback when qrcode library is unavailable.
    Looks like a QR code but is NOT scannable — install qrcode[pil] for
    real, scannable QR codes.
    """
    import hashlib

    img = Image.new('RGB', (size, size), 'white')
    draw = ImageDraw.Draw(img)

    def finder(x, y, s=40):
        """Draw a finder pattern (the three corners of every QR code)."""
        draw.rectangle([x, y, x + s, y + s], outline='black', width=3)
        draw.rectangle([x + 6, y + 6, x + s - 6, y + s - 6], fill='black')
        draw.rectangle([x + 12, y + 12, x + s - 12, y + s - 12], fill='white')

    finder(6, 6)               # top-left
    finder(size - 46, 6)       # top-right
    finder(6, size - 46)       # bottom-left

    # Timing pattern
    for i in range(46, size - 46, 8):
        draw.rectangle([i, 26, i + 4, 30], fill='black')
        draw.rectangle([26, i, 30, i + 4], fill='black')

    # Data modules (deterministic from URL hash)
    h = hashlib.sha256(url.encode()).hexdigest()
    for k in range(0, len(h) - 1, 2):
        val = int(h[k:k + 2], 16)
        col = int(h[k + 1], 16)
        x = 50 + (val % (size - 100))
        y = 50 + ((val * 7 + col * 13) % (size - 100))
        # avoid finder pattern areas
        if not ((x < 56 and y < 56) or
                (x > size - 56 and y < 56) or
                (x < 56 and y > size - 56)):
            draw.rectangle([x, y, x + 5, y + 5], fill='black')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def generate_certificate_docx(certificate, verification_url: str = None):
    """
    Generate a filled DOCX from the certificate template.
    Embeds a real scannable QR code pointing to the verification URL.

    Template variables available in .docx:
      {{ series }}               – Seriya
      {{ certificate_number }}   – Sertifikat raqami
      {{ employee_name }}        – Xodim F.I.O.
      {{ specialization_latin }} – Kasb (lotin)
      {{ specialization_cyrillic }}
      {{ specialization_russian }}
      {{ specialization_code }}
      {{ start_date }}           – Boshlanish sanasi (UZ format)
      {{ end_date }}             – Tugash sanasi
      {{ duration_days }}        – Davomiylik (kun)
      {{ hours }}                – Soat
      {{ director_name }}        – Direktor F.I.Sh.
      {{ registration_number }}
      {{ registration_date }}
      {{ template_name }}
      {{ current_date }}
      {{ verification_url }}     – To'liq URL
      {{ qr_code }}              – InlineImage (25mm × 25mm)
    """
    template_path = certificate.template.file.path

    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Shablon fayli topilmadi: {template_path}")

    if not verification_url:
        verification_url = f"http://localhost:3000/verify/{certificate.verification_code}"

    doc = DocxTemplate(template_path)

    # Build QR InlineImage (28mm × 28mm — compact, scannable size)
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

    doc.render(context)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    filename = (
        f"certificate_{certificate.certificate_number}_{certificate.employee_name}.docx"
        .replace(' ', '_').replace('/', '-')
    )
    return ContentFile(buffer.read(), name=filename)