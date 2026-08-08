import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "focusflow.settings")
django.setup()
from django.core.management import call_command
import sys

# Redirect stdout to a file with utf-8 encoding
with open("sql_out.txt", "w", encoding="utf-8") as f:
    call_command("sqlmigrate", "core", "0001", stdout=f)
print("SQL dumped to sql_out.txt")
