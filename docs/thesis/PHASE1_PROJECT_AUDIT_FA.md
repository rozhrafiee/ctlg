# فاز ۱ — ممیزی کامل پروژه (پایان‌نامه کارشناسی)

**منبع حقیقت:** کد واقعی مخزن `ctlg-2`  
**شاخه بررسی‌شده:** `modification`  
**تاریخ ممیزی:** ۲۵ تیر ۱۴۰۵ (۲۵ ژوئیه ۲۰۲۶)  
**مبنای دستورالعمل:** فایل `pro.txt` (Master Prompt)  
**وضعیت این سند:** فاز ۱ (پشتیبان ممیزی). متن کامل پایان‌نامه در فایل‌های `00` تا `09` همین پوشه نوشته شده است.

> قاعده کلیدی: هیچ قابلیت، موجودیت، الگوریتم، متریک یا اسکرین‌شاتی که در کد/مستندات قابل‌تأیید نباشد، به‌عنوان «پیاده‌سازی‌شده» گزارش نشده است.

---

## A. ممیزی کامل پروژه (Complete Project Audit)

### A.1 هویت پروژه

| مورد | مقدار تأییدشده |
|------|----------------|
| عنوان مفهومی (README) | A Framework for Enhancing Media Literacy and Mitigating Cognitive Threats in Urban Governance |
| نام سامانه در UI | سامانه سنجش شناختی |
| نوع | نمونه اولیه پژوهشی (research prototype) — Client/Server |
| بک‌اند | Django REST + JWT + PostgreSQL در `coglearning/` |
| فرانت‌اند فعال | React + Vite در `cognitive-frontend/` (ریشه مخزن) |
| ماژول الگوریتم/تست | `silver_project/` (مستقل از API فعال) |
| ML ترک سامانه | آموزش آفلاین در `scripts/` + artifact در `models/` |

### A.2 معماری کلان (وضعیت واقعی)

```
Browser (React/Vite)
    ↓ JWT Bearer
Django REST API (/api/...)
    ↓ ORM
PostgreSQL (ctlg)
```

لایه‌های جانبی (نه لزوماً متصل به runtime):

- `silver_project/algorithms` → جستجو/مرتب‌سازی کاتالوگ + تست نرم‌افزار
- `scripts/train_abandonment_model.py` → آموزش مدل ترک سامانه (آفلاین)

### A.3 ماژول‌های Django (پیاده‌سازی‌شده)

| ماژول | مسیر | نقش |
|-------|------|-----|
| accounts | `coglearning/accounts/` | کاربر، نقش، ثبت‌نام، ورود JWT، پروفایل |
| assessment | `coglearning/assessment/` | آزمون شناختی، سؤال، جلسه، پاسخ، تصحیح |
| adaptive_learning | `coglearning/adaptive_learning/` | محتوا، مسیر یادگیری، پیشرفت، پیشنهاد |
| analytics | `coglearning/analytics/` | داشبوردها، خلاصه عملکرد، ترک‌کرده، engagement |

### A.4 نسخه‌های تکراری / خطر سردرگمی

| مورد | وضعیت |
|------|--------|
| `cognitive-frontend/` (ریشه) | **فرانت‌اند فعال** — role guard، JWT refresh، Tailwind |
| `coglearning/cognitive-frontend/` | **نسخه قدیمی/جایگزین** — بدون role guard کامل، صفحات یتیم |
| `coglearning/coglearning/settings.py` | **settings فعال** |
| `coglearning/settings.py` | کپی ریشه — orphan |
| `silver_project` | الگوریتم/تست — **بدون Django app فعال** |
| `package.json` ریشه | کپی ناقص — نقطه ورود نیست |

### A.5 یافته‌های حیاتی ممیزی

1. **قانون ۳۰ روزه ترک‌کرده در runtime پیاده است**؛ مدل ML در API فراخوانی نمی‌شود.
2. **الگوریتم‌های جستجو/مرتب‌سازی فقط در `silver_project` هستند** و به `StudentTestListView` وصل نیستند.
3. **۳۷۶ تست الگوریتم پاس شده‌اند**؛ تست‌های Django خالی‌اند.
4. **فایل مقاله پژوهشی در مخزن یافت نشد.**
5. متریک‌های ML با AUC=1.0 ناشی از برچسب قطعی `avg_login_interval_days >= 30` هستند (نه پیش‌بینی زودهنگام واقعی).

---

## B. پشته فناوری (Technology Stack)

### B.1 بک‌اند (نسخه‌های نصب‌شده روی محیط ممیزی)

| فناوری | نسخه / قید | نقش | محل |
|--------|------------|-----|-----|
| Python | 3.13.5 | زبان | — |
| Django | 5.2.7 (≥5.2) | فریم‌ورک وب | `coglearning/requirements.txt` |
| Django REST Framework | 3.16.1 | API | همان |
| djangorestframework-simplejwt | 5.5.1 | احراز هویت JWT | همان |
| django-cors-headers | 4.9.0 | CORS | همان |
| psycopg | 3.3.4 | درایور PostgreSQL | همان |
| python-dotenv | 1.2.1 | بارگذاری `.env` | همان |
| PostgreSQL | سرویس محلی `ctlg` | پایگاه داده | `settings.py` |

### B.2 فرانت‌اند فعال (`cognitive-frontend/`)

| فناوری | نسخه | نقش |
|--------|------|-----|
| React / React DOM | 18.3.1 | UI |
| Vite | 7.3.1 | bundler |
| react-router-dom | 7.13.0 | مسیریابی |
| axios | 1.13.5 | HTTP client |
| recharts | 3.7.0 | نمودار (صفحه پیشرفت) |
| Tailwind CSS | 3.4.19 | استایل |
| TypeScript | 5.8.3 | typing (جزئی) |

### B.3 یادگیری ماشین (آموزش آفلاین — در requirements بک‌اند pin نشده)

| فناوری | نسخه محیط | نقش |
|--------|-----------|-----|
| scikit-learn | 1.9.0 | مدل‌ها / GridSearch |
| pandas | 2.3.1 | خواندن CSV |
| numpy | 2.3.1 | محاسبات |
| joblib | 1.5.3 | ذخیره مدل |

### B.4 تست الگوریتم (`silver_project`)

| فناوری | قید | نقش |
|--------|-----|-----|
| pytest | ≥8.0 | اجرای تست |
| pytest-cov | ≥5.0 | پوشش کد |
| mutmut | ≥2.5 | پیکربندی شده؛ cache نتیجه در repo نیست |

---

## C. فهرست ماژول‌ها و وضعیت پیاده‌سازی

| ماژول / قابلیت | وضعیت | شواهد |
|----------------|--------|--------|
| ثبت‌نام / ورود JWT / پروفایل | پیاده‌سازی‌شده | `accounts/views.py`, `AuthContext.jsx` |
| نقش‌ها student/teacher/admin | پیاده‌سازی‌شده | `accounts/models.py`, `permissions.py` |
| آزمون تعیین سطح | پیاده‌سازی‌شده | `AssessmentService.apply_level_logic` |
| شرکت در آزمون MCQ/تشریحی | پیاده‌سازی‌شده | `assessment/views.py` |
| تصحیح دستی تشریحی | پیاده‌سازی‌شده | `submit_manual_grade` |
| محتوا و مسیر یادگیری تطبیقی | پیاده‌سازی‌شده | `AdaptiveLearningEngine` |
| پیشنهاد محتوا بر اساس سطح | پیاده‌سازی‌شده | `generate_recommendations` |
| داشبورد شهروند | پیاده‌سازی‌شده | `StudentDashboardView` + UI |
| داشبورد مدرس | پیاده‌سازی‌شده | `TeacherDashboardView` + UI |
| پنل engagement ادمین | پیاده‌سازی‌شده | `AdminEngagementMetricsView` |
| قانون ترک‌کرده ۳۰ روزه | پیاده‌سازی‌شده | `evaluate_abandonment` |
| آموزش مدل ML ترک | جزئی | اسکریپت + artifact؛ بدون inference |
| پیش‌بینی ML در runtime | پیشنهادی | `joblib.load` در Django یافت نشد |
| جستجو/مرتب‌سازی کاتالوگ در API | طراحی‌شده / پیشنهادی | فقط در `silver_project` |
| ترجیح الگوریتم کاربر | یافت نشد | فیلد در `User` نیست |
| سیستم اعلان (Notification) مستقل | یافت نشد | فقط alerts داخل داشبورد |
| تست واحد Django | طراحی‌شده | `tests.py` خالی |
| تست الگوریتم ACOC/CFG/Mutation | پیاده‌سازی‌شده | `silver_project` — ۳۷۶ پاس |

---

## D. نقش‌های کاربری

| نقش (DB) | برچسب فارسی | دسترسی اصلی | داشبورد |
|----------|-------------|-------------|---------|
| `student` | شهروند | آزمون، مسیر یادگیری، پیشرفت، پیشنهاد | `/student/dashboard` |
| `teacher` | مسئول شهری (مدرس) | محتوا، آزمون، تصحیح، گزارش یک شهروند | `/teacher/dashboard` |
| `admin` | مدیر سیستم | همه دسترسی teacher + engagement metrics | `/admin/engagement` (+ teacher dashboard) |

**یادداشت‌ها:**

- `IsTeacher` شامل `admin` و `superuser` هم می‌شود.
- `IsStudent` تعریف شده ولی در viewها استفاده نشده.
- در ثبت‌نام، فیلد `role` پذیرفته می‌شود (محدودیت سخت سمت سرور برای جلوگیری از انتخاب admin یافت نشد).

---

## E. موجودیت‌های پایگاه داده

### E.1 accounts
- `User` (AbstractUser + `role`, `cognitive_level`, `has_taken_placement_test`)

### E.2 assessment
- `CognitiveTest`
- `Question` (UniqueConstraint: test+order)
- `Choice`
- `TestSession`
- `Answer`

### E.3 adaptive_learning
- `LearningContent`
- `LearningPath`
- `LearningPathItem`
- `UserContentProgress`
- `ContentRecommendation`

### E.4 analytics
- `LevelHistory`
- `LearningAnalytics`
- `UserPerformanceSummary` (OneToOne با User؛ فیلدهای engagement CSV)
- `UserAbandonmentSample`

**جمع:** ۱۵ مدل سفارشی (+ جداول استاندارد Django auth/admin/sessions)

Migrationها اعمال‌شده‌اند (`showmigrations` همه `[X]`).

---

## F. فهرست APIها (endpoints واقعی)

پایه: `/api/`

### F.1 accounts
| متد | مسیر |
|-----|------|
| POST | `/api/accounts/login/` |
| POST | `/api/accounts/token/refresh/` |
| POST | `/api/accounts/register/` |
| GET/PATCH | `/api/accounts/profile/` |

### F.2 assessment (خلاصه)
| حوزه | نمونه مسیرها |
|------|---------------|
| مدرس | `teacher/tests/all|create|update|delete`, questions, reviews, grade |
| شهروند | `tests/`, `tests/<id>/`, `start`, `answer`, `finish`, `my-history`, `student/results/<id>/` |

### F.3 adaptive-learning
| مسیر | نکته |
|------|------|
| `recommended/`, `learning-path/`, `learning-roadmap/` | نیازمند placement برای دانشجو |
| `progress/`, `content/<id>/`, `dashboard/` | IsAuthenticated پیش‌فرض |
| `teacher/contents/` و CRUD محتوا | IsTeacher |

### F.4 analytics
| مسیر | نقش |
|------|-----|
| `student-dashboard/` | شهروند |
| `teacher-dashboard/` | مدرس |
| `my-stats/` | شهروند |
| `student-report/<id>/` | مدرس |
| `system-report/` | ادمین |
| `engagement-metrics/` | ادمین |

**توجه:** `API_SUMMARY.md` برخی موارد را بیش از واقع ادعا می‌کند (مثلاً پوشش کامل `HasTakenPlacementTest` و استفاده تحلیلی از `time_spent_seconds`).

---

## G. فهرست الگوریتم‌ها

### G.1 محل واقعی کد
`silver_project/algorithms/`

| الگوریتم | فایل | تابع |
|----------|------|------|
| Bubble Sort | `sorting.py` | `bubble_sort` |
| Merge Sort | `sorting.py` | `merge_sort`, `_merge` |
| Linear Search | `searching.py` | `linear_search` |
| Binary Search | `searching.py` | `binary_search` |
| Catalog pipeline | `catalog.py` | `process_catalog` |
| Utils | `utils.py` | `get_item_value` |

### G.2 اتصال به سامانه اصلی
**وضعیت: متصل نیست.**  
`StudentTestListView` فقط queryset ORM برمی‌گرداند؛ بدون `q` / `sort_algo` / `search_algo` / `catalog_meta`.

### G.3 ترجیحات کاربر
**یافت نشد** در `accounts.User` و پروفایل فرانت‌اند فعال.

---

## H. روش‌های تست نرم‌افزار (تأییدشده)

| روش | محل | نتیجه تأییدشده |
|-----|-----|----------------|
| ACOC (All Combinations) | `test_coverage.py` | ۳۲۴ + ۶ تست |
| Node Coverage | `TestNodeCoverage` | ۱۴ تست |
| Edge Coverage | `TestEdgeCoverage` | ۹ تست |
| Prime Path Coverage | `TestPrimePathCoverage` | ۶ تست |
| Mutation Testing (AOR دستی) | `mutants/` + `test_mutation_killing.py` | ۱۴ جهش |
| اجرای کلی pytest | `silver_project` | **۳۷۶ passed in 8.56–8.93s** |
| Mutation Score (پس از اصلاح assert) | `test_mutation_score_calculation` | **۱۱/۱۲ = ۹۱٫۷٪** |
| Equivalent mutants | MS-03, BN-03 | ۲ مورد |
| تست Django apps | `*/tests.py` | خالی / خطا در discovery |

**پوشش کد الگوریتم (اجرای واقعی با pytest-cov):** sorting/searching ≈۱۰۰٪؛ catalog ≈۹۷٪؛ کل پکیج ≈۷۷٪ (شامل demo و mutants).

---

## I. اجزای یادگیری ماشین / پیش‌بینی ترک سامانه

### I.1 وضعیت کلی

| لایه | وضعیت |
|------|--------|
| قانون قطعی ۳۰ روزه در پلتفرم | **پیاده‌سازی کامل** |
| تولید دیتاست CSV / seed | **پیاده‌سازی** |
| آموزش آفلاین مدل | **پیاده‌سازی** |
| ذخیره artifact (`joblib`) | **پیاده‌سازی** |
| Inference در API/UI | **پیشنهادی / یافت نشد** |
| نمایش risk score مدل در داشبورد | **یافت نشد** (UI قانون ۳۰ روزه را نشان می‌دهد) |

### I.2 ویژگی‌ها و برچسب

| Feature | معنی در آموزش CSV |
|---------|-------------------|
| `avg_login_interval_days` | در داده سنتتیک عملاً معیار آستانه ترک |
| `duration_of_use_minutes` | مدت استفاده |
| `failed_tests_count` | تعداد آزمون ناموفق |
| `progress_rate` | نرخ پیشرفت ۰–۱ |
| `abandoned` | هدف؛ در CSV: `avg_login_interval_days >= 30` |

### I.3 مدل‌ها و نتایج (از `datasets/ml/abandonment_model_results.json`)

| مدل | Accuracy | F1 | ROC-AUC |
|-----|----------|----|---------|
| RandomForest_Tuned (بهترین) | 1.0 | 1.0 | 1.0 |
| HistGradientBoosting_Tuned | 1.0 | 1.0 | 1.0 |
| Calibrated_HGB | 0.9975 | 0.9974 | 0.9976 |
| LogisticRegression | 0.9975 | 0.9974 | 1.0 |

- Threshold نهایی: **۰٫۳۳**
- Confusion Matrix (holdout): tn=206, fp=0, fn=0, tp=194
- دیتاست: ۲۰۰۰ نمونه (۹۷۱ abandoned / ۱۰۲۹ retained)، split ۸۰/۲۰

**تفسیر علمی برای پایان‌نامه:** امتیاز نزدیک به کامل به‌خاطر جداسازی قطعی برچسب از یک ویژگی است؛ نباید به‌عنوان قدرت پیش‌بینی زودهنگام ادعا شود.

**تناقض artifact:** `abandonment_model_summary.txt` نتایج قدیمی‌تر (Calibrated_HGB ≈۰٫۷۸) دارد و با JSON فعلی هم‌خوان نیست → در پایان‌نامه فقط JSON/joblib فعلی را مرجع قرار دهید یا صریحاً دو اجرا را جدا کنید.

---

## J. خلاصه مقاله پژوهشی (محدود)

| مورد | وضعیت |
|------|--------|
| فایل مقاله در مخزن (pdf/tex/docx/bib) | **یافت نشد** |
| اشاره در README | «accompanying academic study» — چارچوب سواد رسانه‌ای و تهدیدات شناختی در حکمرانی شهری |
| مفاهیم قابل استخراج از README/سامانه | ارزیابی شناختی، یادگیری تطبیقی، تحلیل رفتار، نقش شهروند/خبره/مدیر |

**اقدام لازم تیم:** فایل مقاله را در مخزن یا مسیر مشخص تحویل دهید تا فاز ۲ (تحلیل مقاله) کامل شود.

---

## K. مقایسه مقاله ↔ پروژه (موقت، بر اساس README + کد)

| مفهوم / قابلیت | مقاله (طبق README) | پروژه فعلی | وضعیت |
|----------------|---------------------|------------|--------|
| ارزیابی شناختی | پیشنهاد شده | پیاده | پیاده‌سازی‌شده |
| یادگیری تطبیقی | پیشنهاد شده | پیاده | پیاده‌سازی‌شده |
| تحلیل رفتار | پیشنهاد شده | جزئی (خلاصه عملکرد + engagement) | جزئی |
| هشدار / اعلان | ذکر در README | فقط alerts داشبورد | جزئی |
| مدیریت و analytics | پیشنهاد شده | داشبوردها + engagement | پیاده‌سازی‌شده (جزئی برای admin) |
| سناریوی موردی اختلال شهری | ذکر در README | در کد جداگانه یافت نشد | پیشنهادی / نامشخص |
| پیش‌بینی ترک سامانه | خارج از خلاصه README | قانون ۳۰ روزه + ML آفلاین | جزئی |
| الگوریتم کاتالوگ + تست جهش | خارج از README | در `silver_project` | پیاده‌سازی‌شده (جدا از runtime) |

---

## L. فهرست مطالب پیشنهادی نهایی پایان‌نامه

*(بر اساس `pro.txt`، با تعدیل بر اساس واقعیت کد)*

### صفحات مقدماتی
عنوان، تصویب، تقدیم، سپاسگزاری، چکیده فارسی/انگلیسی، کلیدواژه‌ها، فهرست مطالب/اشکال/جداول/اختصارات

### فصل ۱ — مقدمه و بیان مسئله
۱٫۱ تا ۱٫۱۱ مطابق ساختار `pro.txt`

### فصل ۲ — مبانی نظری و پیشینه
تمرکز کوتاه: ارزیابی شناختی، یادگیری تطبیقی، ترک سامانه، الگوریتم‌های جستجو/مرتب‌سازی، پوشش مسیر، آزمون جهش، مقاله تیم

### فصل ۳ — تحلیل و طراحی سامانه
الزامات، نقش‌ها، معماری، workflow، Use Case، ER، Class، Sequence، Activity، DFD، طراحی ماژول‌ها

### فصل ۴ — پیاده‌سازی سامانه و الگوریتم‌ها
فناوری‌ها، بک‌اند، فرانت‌اند، پایگاه داده، احراز هویت، assessment، adaptive، catalog (با ذکر وضعیت اتصال)، ترک‌کرده و ML آفلاین

### فصل ۵ — آزمون نرم‌افزار و ارزیابی کیفیت
ACOC، CFG، Node/Edge/Prime Path، Mutation/AOR، Mutation Score، نتایج ۳۷۶ تست

### فصل ۶ — پیش‌بینی ترک سامانه و یادگیری ماشین
داده، ویژگی‌ها، آموزش، نتایج، تمایز قانون ۳۰ روزه vs ML، محدودیت‌ها

### فصل ۷ — نتایج و بحث
مقایسه اهداف / مقاله / پیاده‌سازی / تست / ML

### فصل ۸ — نتیجه‌گیری و کارهای آینده

### مراجع و پیوست‌ها
پیوست A: Mermaid  
پیوست B: اسکرین‌شات‌ها  
پیوست C: جداول تکمیلی  
پیوست D: نمونه کدهای مهم

---

## M. فهرست اشکال پیشنهادی

| # | عنوان شکل | فصل پیشنهادی | وضعیت پشتیبانی کد |
|---|-----------|--------------|-------------------|
| 1 | معماری کلی Client–Server | ۳ / ۴ | تأیید |
| 2 | گردش کلی سامانه | ۳ | تأیید |
| 3 | Workflow داشبورد شهروند | ۳ | تأیید |
| 4 | Workflow داشبورد مدرس | ۳ | تأیید |
| 5 | Workflow داشبورد engagement ادمین | ۳ | تأیید |
| 6 | Use Case | ۳ | تأیید |
| 7 | ER Diagram | ۳ | تأیید |
| 8 | Class Diagram (مدل‌ها/سرویس‌ها) | ۳ | تأیید |
| 9 | Sequence: ورود | ۳ | تأیید |
| 10 | Sequence: شرکت در آزمون | ۳ | تأیید |
| 11 | Sequence: مسیر یادگیری | ۳ | تأیید |
| 12 | Pipeline کاتالوگ (silver_project) | ۴ / ۵ | تأیید در silver؛ اتصال runtime خیر |
| 13 | CFG الگوریتم‌ها | ۵ | تأیید مفهومی از تست‌ها |
| 14 | چرخه Mutation Testing | ۵ | تأیید |
| 15 | Pipeline آموزش ML | ۶ | تأیید آفلاین |
| 16 | Workflow قانون ۳۰ روزه | ۶ | تأیید |
| 17 | اسکرین‌شات صفحات واقعی | ۴ | نیاز به تهیه توسط تیم |

---

## N. فهرست جداول پیشنهادی

1. پشته فناوری و نسخه‌ها  
2. نقش‌های کاربری و دسترسی  
3. الزامات کارکردی استخراج‌شده از کد  
4. الزامات غیرکارکردی تأییدپذیر  
5. ماژول‌های سامانه  
6. موجودیت‌های پایگاه داده  
7. فهرست API  
8. مقایسه پیچیدگی الگوریتم‌ها  
9. پارامترهای ACOC  
10. نتایج Node/Edge/Prime Path  
11. جدول جهش‌های AOR  
12. Mutation Score  
13. ویژگی‌های ML  
14. مقایسه مدل‌های ML (از JSON)  
15. شکاف مقاله ↔ پیاده‌سازی  
16. وضعیت Fully/Partial/Proposed هر قابلیت  

---

## O. اسکرین‌شات‌های پیشنهادی (فقط صفحات موجود)

| شکل | صفحه | مسیر فرانت | فصل |
|-----|------|------------|-----|
| — | صفحه ورود | `/login` | ۴ |
| — | ثبت‌نام | `/register` | ۴ |
| — | داشبورد شهروند | `/student/dashboard` | ۴ |
| — | آزمون تعیین سطح | `/student/placement-test` | ۴ |
| — | لیست آزمون‌ها | `/student/tests` | ۴ |
| — | شرکت در آزمون | `/student/tests/:id/take` | ۴ |
| — | مسیر یادگیری | `/student/learning-path` | ۴ |
| — | پیشرفت (نمودار) | `/student/progress` | ۴ |
| — | داشبورد مدرس | `/teacher/dashboard` | ۴ |
| — | مدیریت محتوا/آزمون/تصحیح | `/teacher/...` | ۴ |
| — | شاخص‌های ترک سیستم | `/admin/engagement` | ۴ / ۶ |

**نساختن:** صفحه نتیجه پیش‌بینی ML در UI (وجود ندارد).  
**نساختن:** UI جستجو/مرتب‌سازی الگوریتمی کاتالوگ در فرانت فعال (وجود ندارد).

---

## P. فهرست دیاگرام‌های Mermaid موردنیاز

1. معماری سامانه  
2. گردش کلی پلتفرم  
3. Workflow هر داشبورد واقعی  
4. Use Case  
5. ER  
6. Class  
7. Sequenceهای اصلی  
8. Activity (ورود، آزمون، ترک‌کرده)  
9. DFD سطح ۰/۱ (در صورت نیاز)  
10. Pipeline `process_catalog` (با برچسب «ماژول جانبی»)  
11. Pipeline آموزش ML  
12. Workflow قانون ۳۰ روزه  
13. Workflow تست / Mutation  

*(تولید کد Mermaid = فاز ۶ طبق `pro.txt`؛ در این سند فقط فهرست شده است.)*

---

## Q. اطلاعات ناقص که باید تیم پروژه تأمین کند

| # | مورد | دلیل |
|---|------|------|
| 1 | فایل مقاله پژوهشی تیم | برای فاز ۲ و استناد |
| 2 | مشخصات سخت‌افزاری محیط آزمایش | فصل نتایج |
| 3 | اسکرین‌شات‌های واقعی UI | پیوست B |
| 4 | مشخصات قالب دانشگاه (فونت، حاشیه، شماره فصل) | صفحه‌آرایی ۹۰–۱۲۰ صفحه |
| 5 | تصمیم درباره یکپارچه‌سازی الگوریتم با API | آیا Future Work است یا باید قبل از پایان‌نامه وصل شود؟ |
| 6 | تصمیم درباره inference مدل ML در runtime | قانون ۳۰ روزه کافی است یا risk score هم لازم است؟ |
| 7 | هم‌تراز کردن `summary.txt` با `results.json` | جلوگیری از تناقض متریک‌ها |
| 8 | مشخص کردن فرانت‌اند رسمی (ریشه vs `coglearning/cognitive-frontend`) | حذف سردرگمی مستندات |
| 9 | نام کامل نویسندگان، استاد راهنما، دانشگاه، سال | صفحات مقدماتی |
| 10 | تأیید یا رد ادعاهای `ALGORITHM_TESTING_REPORT_FA.md` درباره اتصال به coglearning | اصلاح مستندات قبل از فصل ۵ |

---

## جمع‌بندی فاز ۱ (برای تیم)

سامانه واقعی یک **پلتفرم ارزیابی شناختی + یادگیری تطبیقی + analytics** با سه نقش است.  
**ترک‌کرده** در تولید با **قانون ۳۰ روزه** اعمال می‌شود.  
**مدل ML** آموزش داده شده ولی به runtime وصل نیست.  
**الگوریتم‌ها و ۳۷۶ تست** در `silver_project` معتبرند ولی به API فعال وصل نیستند.  
**مقاله پژوهشی در مخزن نیست.**

---

## گام بعدی (طبق `pro.txt`)

پس از تأیید این ممیزی توسط تیم:

1. **فاز ۲:** تحلیل مقاله (نیاز به فایل مقاله)  
2. **فاز ۳–۵:** شکاف مقاله/پروژه، فهرست مطالب نهایی، برنامه بصری  
3. **فاز ۶:** تولید دیاگرام‌های Mermaid  
4. **فاز ۷:** نوشتن **فصل ۱** و توقف برای تأیید  

اگر موافقید، در پیام بعدی بفرستید:  
- فایل مقاله را ضمیمه/مسیر دهید، یا  
- بگویید «بدون مقاله، فصل ۱ را شروع کن» تا بر اساس README + کد ادامه دهیم.
