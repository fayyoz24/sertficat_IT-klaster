"""
Certificate DOCX generator with QR code support (docxtpl + qrcode).
QR code is embedded in the bottom-right of the document via InlineImage.
"""
import io
import os
import qrcode
from datetime import datetime
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
from django.core.files.base import ContentFile


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
    """Generate a clean QR code PNG image in memory."""
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


def generate_certificate_docx(certificate, verification_url: str = None):
    """
    Generate a filled DOCX from the certificate template.
    Embeds a QR code pointing to the verification URL.
    
    Template variables available:
      {{ certificate_number }}, {{ employee_name }}, {{ specialization_latin }},
      {{ start_date }}, {{ end_date }}, {{ duration_days }}, {{ hours }},
      {{ director_name }}, {{ registration_number }}, {{ registration_date }},
      {{ series }}, {{ template_name }}, {{ current_date }},
      {{ verification_url }}, {{ qr_code }}   ← InlineImage
    """
    template_path = certificate.template.file.path

    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Shablon fayli topilmadi: {template_path}")

    if not verification_url:
        verification_url = f"http://localhost:3000/verify/{certificate.verification_code}"

    doc = DocxTemplate(template_path)

    # Build QR InlineImage (25mm × 25mm — compact bottom-right size)
    qr_buf = make_qr_image(verification_url)
    qr_image = InlineImage(doc, qr_buf, width=Mm(25), height=Mm(25))

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