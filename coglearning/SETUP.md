# راه‌اندازی پروژه CogLearning

## پیش‌نیاز
- Python 3.11+
- Node.js 18+
- npm یا pnpm

---

## ۱. بک‌اند (Django)

**بدون محیط مجازی** — از پوشهٔ بک‌اند:

```powershell
cd c:\Users\Laptopkaran\Videos\ctlg\coglearning

# نصب وابستگی‌ها (یک بار)
pip install -r requirements.txt

# اجرای مایگریشن‌ها (یک بار)
python manage.py migrate

# (اختیاری) ساخت سوپریوزر برای ادمین
python manage.py createsuperuser

# اجرای سرور
python manage.py runserver
# یا: .\runserver.ps1   یا   runserver.bat
```

بک‌اند روی **http://127.0.0.1:8000** بالا می‌آید.

---

## ۲. فرانت‌اند (React + Vite)

در یک ترمینال **جدید** (بک‌اند را ببند یا باز بگذار):

```powershell
cd c:\Users\Laptopkaran\Videos\ctlg\coglearning\cognitive-frontend

# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run dev
```

فرانت روی آدرسی مثل **http://localhost:5173** باز می‌شود.

---

## ۳. چک‌لیست قبل از اجرا

| کار | دستور / فایل |
|-----|----------------|
| وابستگی بک‌اند نصب باشد | `pip install -r requirements.txt` (از داخل `coglearning`) |
| دیتابیس مایگریت شده باشد | `python manage.py migrate` (از داخل `coglearning`) |
| آدرس API در فرانت درست باشد | فایل `cognitive-frontend/.env` و مقدار `VITE_API_BASE_URL=http://127.0.0.1:8000` |
| وابستگی فرانت نصب باشد | داخل `cognitive-frontend`: `npm install` |

---

## خلاصه دستورات (هر بار برای اجرا)

**ترمینال ۱ – بک‌اند:**
```powershell
cd c:\Users\Laptopkaran\Videos\ctlg\coglearning
python manage.py runserver
```

**ترمینال ۲ – فرانت:**
```powershell
cd c:\Users\Laptopkaran\Videos\ctlg\coglearning\cognitive-frontend
npm run dev
```

بعد از این دو، مرورگر را روی آدرس فرانت (مثلاً http://localhost:5173) باز کن.
