# صفحات مقدماتی و فهرست مطالب

## صفحه عنوان (پیشنویس)

**دانشگاه / دانشکده:** *[توسط تیم تکمیل شود]*  
**عنوان پایان‌نامه:** طراحی و پیاده‌سازی سامانه ارزیابی شناختی و یادگیری تطبیقی با تحلیل رفتار کاربر، ارزیابی کیفیت نرم‌افزار و بررسی پیش‌بینی ترک سامانه  
**رشته:** مهندسی نرم‌افزار / کامپیوتر / فناوری اطلاعات  
**نگارندگان:** *[نام‌ها]*  
**استاد راهنما:** *[نام]*  
**سال تحصیلی:** *[سال]*

---

## تقدیم

این اثر به خانواده، استادان و شهروندانی تقدیم می‌شود که انگیزه طراحی سامانه‌ای برای تقویت سواد شناختی و تاب‌آوری در فضای اطلاعات شهری را فراهم کردند.

---

## سپاسگزاری

از استاد راهنما و اعضای تیم پروژه که در طراحی مفهومی، پیاده‌سازی نرم‌افزار، آزمون الگوریتم‌ها و توسعه ماژول تحلیل ترک سامانه مشارکت داشتند، صمیمانه سپاسگزاریم. همچنین از بازبینی کد و مستندسازی مبتنی بر مخزن واقعی قدردانی می‌شود.

---

## چکیده فارسی

گسترش اطلاعات گمراه‌کننده و تهدیدات شناختی در محیط‌های شهری، نیاز به سامانه‌هایی را برجسته کرده که بتوانند توانمندی‌های شناختی شهروندان را ارزیابی کنند، محتوای آموزشی را به‌صورت تطبیقی ارائه دهند و رفتار کاربر را برای بهبود ماندگاری در سامانه تحلیل نمایند. در این پایان‌نامه، نمونه اولیه پژوهشی «سامانه سنجش شناختی» بر اساس معماری Client–Server با بک‌اند Django REST Framework، احراز هویت JWT، پایگاه‌داده PostgreSQL و فرانت‌اند React/Vite توصیف و ارزیابی می‌شود.

سامانه سه نقش شهروند، مسئول شهری (مدرس) و مدیر سیستم را پشتیبانی می‌کند و ماژول‌های ارزیابی شناختی، یادگیری تطبیقی، تحلیل عملکرد و داشبوردهای نقش‌محور را پیاده‌سازی کرده است. وضعیت «ترک‌کرده» در زمان اجرا با قانون قطعی بی‌فعالیتی ۳۰ روزه تعیین و در صورت لزوم حساب کاربر غیرفعال می‌شود. افزون بر این، یک خط یادگیری ماشین آفلاین برای پیش‌بینی ترک بر اساس چهار ویژگی رفتاری آموزش داده شده است؛ هرچند خروجی مدل در API زمان اجرا فراخوانی نمی‌شود.

در بخش ارزیابی کیفیت نرم‌افزار، الگوریتم‌های جستجو و مرتب‌سازی کاتالوگ در مسیر تولید (`coglearning/algorithms`) به API لیست آزمون متصل شده‌اند و سوئیت `silver_project` با ۳۷۶ آزمون (ACOC، پوشش گره/یال/مسیر نخستین، آزمون جهش AOR) امتیاز جهش نهایی ۱۱ از ۱۲ (۹۱٫۷٪) را نشان می‌دهد. در پایان، دستاوردها، محدودیت‌ها (از جمله نبود inference مدل ترک در runtime) و مسیر کارهای آینده بیان می‌شود.

**کلیدواژه‌ها:** ارزیابی شناختی، یادگیری تطبیقی، تحلیل رفتار کاربر، پیش‌بینی ترک سامانه، آزمون جهش، پوشش مسیر، Django، React

---

## Abstract (English)

The spread of misinformation and cognitive threats in urban environments motivates digital platforms that assess citizens’ cognitive abilities, deliver adaptive learning content, and analyze user behavior to improve retention. This bachelor’s thesis documents a research prototype—“Cognitive Assessment Platform”—implemented with a Django REST backend, JWT authentication, PostgreSQL, and a React/Vite frontend.

The system supports citizen, urban officer (teacher), and admin roles, and implements cognitive assessment, adaptive learning, performance analytics, and role-based dashboards. Runtime abandonment is determined by a deterministic 30-day inactivity rule that can deactivate accounts. An offline machine-learning pipeline was also trained on four behavioral features; however, model inference is not wired into the live API.

Software quality evaluation covers catalog search/sorting algorithms wired into the live assessment API (`coglearning/algorithms`), with a 376-test suite in `silver_project` (ACOC, node/edge/prime-path, AOR mutation testing) achieving a final mutation score of 11/12 (91.7%). Contributions, limitations, and future work are discussed with strict grounding in the actual repository.

**Keywords:** Cognitive Assessment, Adaptive Learning, User Behavior Analysis, Dropout Prediction, Mutation Testing, Path Coverage, Django, React

---

## فهرست اختصارات

| اختصار | معادل فارسی | انگلیسی |
|--------|-------------|--------|
| LMS | سامانه مدیریت یادگیری | Learning Management System |
| JWT | توکن وب JSON | JSON Web Token |
| API | رابط برنامه‌نویسی کاربردی | Application Programming Interface |
| ORM | نگاشت شیء-رابطه‌ای | Object-Relational Mapping |
| ACOC | آزمون همه ترکیبات | All Combinations |
| CFG | گراف جریان کنترل | Control Flow Graph |
| AOR | جایگزینی عملگر حسابی | Arithmetic Operator Replacement |
| ML | یادگیری ماشین | Machine Learning |
| ROC-AUC | سطح زیر منحنی ویژگی عملکرد گیرنده | Receiver Operating Characteristic – Area Under Curve |
| HGB | تقویت گرادیان هیستوگرامی | HistGradientBoosting |
| DRF | جنگو REST Framework | Django REST Framework |

---

## فهرست مطالب

### فصل ۱ — مقدمه و بیان مسئله
۱٫۱ مقدمه  
۱٫۲ پیشینه مختصر  
۱٫۳ بیان مسئله  
۱٫۴ انگیزه پژوهش  
۱٫۵ اهمیت و ضرورت  
۱٫۶ اهداف پژوهش  
۱٫۷ سؤالات پژوهش  
۱٫۸ دامنه پروژه  
۱٫۹ نوآوری و مشارکت  
۱٫۱۰ روش‌شناسی پژوهش و توسعه  
۱٫۱۱ ساختار پایان‌نامه  

### فصل ۲ — مبانی نظری و پیشینه مرتبط
۲٫۱ تا ۲٫۱۶ (ارزیابی شناختی، یادگیری تطبیقی، ترک سامانه، الگوریتم‌ها، آزمون نرم‌افزار، مقاله تیم، شکاف پژوهش)

### فصل ۳ — تحلیل و طراحی سامانه
۳٫۱ تا ۳٫۱۸ + دیاگرام‌های Mermaid

### فصل ۴ — پیاده‌سازی سامانه و الگوریتم‌ها
۴٫۱ تا ۴٫۱۹

### فصل ۵ — آزمون نرم‌افزار و ارزیابی کیفیت
۵٫۱ تا ۵٫۱۹

### فصل ۶ — پیش‌بینی ترک سامانه و یادگیری ماشین
۶٫۱ تا ۶٫۱۶

### فصل ۷ — نتایج و بحث
۷٫۱ تا ۷٫۱۲

### فصل ۸ — نتیجه‌گیری و کارهای آینده
۸٫۱ تا ۸٫۷

### مراجع و پیوست‌ها

---

## فاز ۲ — تحلیل مقاله (محدود)

**وضعیت فایل مقاله:** در مخزن یافت نشد.  
**منبع جایگزین:** `README.md` ریشه پروژه.

| مؤلفه | استخراج از README | پیاده‌سازی در پروژه؟ | محل |
|-------|-------------------|----------------------|-----|
| چارچوب سواد رسانه‌ای / تهدید شناختی | بله | مفهومی در نام/هدف سامانه | README + UI «سامانه سنجش شناختی» |
| ارزیابی شناختی | بله | بله | assessment |
| یادگیری تطبیقی | بله | بله | adaptive_learning |
| تحلیل رفتار | بله | جزئی | analytics |
| هشدار/اعلان | بله | جزئی (alerts داشبورد) | StudentDashboardView |
| مدیریت و analytics | بله | بله | analytics + admin engagement |
| سناریوی اختلال خدمات شهری | بله | در کد جداگانه یافت نشد | — |
| پیش‌بینی ترک | خیر (در README نیست) | جزئی (قانون ۳۰ روزه + ML آفلاین) | analytics / scripts |
| تست الگوریتم/جهش | خیر | بله + اتصال API | `coglearning/algorithms` + `silver_project` |

---

## فاز ۳ — جدول شکاف مقاله ↔ پروژه

| ویژگی / مفهوم | مقاله (README) | پروژه فعلی | وضعیت |
|---------------|----------------|------------|--------|
| ارزیابی شناختی | پیشنهاد | پیاده | پیاده‌سازی‌شده |
| یادگیری تطبیقی | پیشنهاد | پیاده | پیاده‌سازی‌شده |
| تحلیل رفتار | پیشنهاد | داشبورد + engagement | جزئی |
| اعلان/هشدار | پیشنهاد | alerts متنی داشبورد | جزئی |
| مدیریت و گزارش | پیشنهاد | داشبورد مدرس/ادمین | پیاده‌سازی‌شده |
| Case شهری | پیشنهاد | یافت نشد در کد | پیشنهادی |
| ترک‌کرده ۳۰ روزه | — | پیاده | پیاده‌سازی‌شده |
| Inference ML ترک | — | نیست | پیشنهادی / آینده |
| کاتالوگ الگوریتمی در API | — | پیاده | پیاده‌سازی‌شده |
| ۳۷۶ تست الگوریتم | — | پیاده | پیاده‌سازی‌شده |

---

## فاز ۵ — برنامه بصری (جایگزین اسکرین‌شات با Mermaid)

تمام نماهای UI با **دیاگرام جریان/ساختار Mermaid** در فصول ۳–۶ و پیوست A ارائه می‌شوند؛ نیازی به فایل تصویری جدا نیست.
