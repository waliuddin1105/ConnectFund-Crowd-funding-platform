#only run this file if u wanna reset the database
from api import app, db

with app.app_context():
    db.drop_all()
    db.create_all()

print("✅ Database reset successfully!")


