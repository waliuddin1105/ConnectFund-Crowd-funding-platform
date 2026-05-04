import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SENDER_EMAIL = "crowdfundpk.noreply@gmail.com"
SENDER_PASSKEY = "kkghcqhchxfadokx"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def send_email(receiver_email, subject, template_name, **kwargs):
    template_path = os.path.join(BASE_DIR, "email_templates", template_name)

    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Email template not found: {template_path}")

    with open(template_path, "r", encoding="utf-8") as f:
        html_template = f.read()

    for key, value in kwargs.items():
        html_template = html_template.replace(f"{{{{{key}}}}}", str(value))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg.attach(MIMEText(html_template, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSKEY)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        server.quit()
        return {"message": f"Email sent to {receiver_email}"}
    except Exception as e:
        raise RuntimeError(f"Could not send email. Error: {e}")