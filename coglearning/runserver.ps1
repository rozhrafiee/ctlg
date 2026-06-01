# Run Django server - avoids PowerShell showing Django stderr as red errors
# Usage: .\runserver.ps1   (from coglearning folder, with venv activated)
& python manage.py runserver 2>&1
