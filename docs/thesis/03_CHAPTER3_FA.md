# فصل ۳ — تحلیل و طراحی سامانه

## ۳٫۱ مقدمه

این فصل سامانه را بر اساس کد واقعی تحلیل و طراحی می‌کند. دیاگرام‌ها به‌صورت **Mermaid** ارائه شده‌اند و جایگزین اسکرین‌شات هستند.

## ۳٫۲ نمای کلی سامانه

سامانه سنجش شناختی یک پلتفرم وب Client–Server است که شهروندان را ارزیابی و آموزش می‌دهد، مسئول شهری محتوا/آزمون را مدیریت می‌کند و مدیر شاخص‌های ماندگاری را می‌بیند.

## ۳٫۳ اهداف سامانه

1. ثبت‌نام/ورود امن با JWT  
2. تعیین سطح و ارتقای سطح ۱–۱۰۰  
3. ارائه محتوا و مسیر تطبیقی  
4. تصحیح آزمون‌های تشریحی  
5. پایش عملکرد و ترک‌کرده  

## ۳٫۴ ذی‌نفعان و نقش‌ها

| نقش | بازیگر | مسئولیت |
|-----|--------|---------|
| student | شهروند | آزمون، یادگیری، مشاهده پیشرفت |
| teacher | مسئول شهری (مدرس) | محتوا، آزمون، تصحیح |
| admin | مدیر سیستم | گزارش‌ها و engagement |

## ۳٫۵ نیازمندی‌های کارکردی (استخراج از پیاده‌سازی)

| شناسه | نیازمندی | وضعیت |
|-------|----------|--------|
| FR01 | ثبت‌نام و ورود JWT | پیاده |
| FR02 | مدیریت پروفایل | پیاده |
| FR03 | ایجاد/ویرایش آزمون و سؤال توسط مدرس | پیاده |
| FR04 | شرکت در آزمون و ثبت پاسخ | پیاده |
| FR05 | نمره‌دهی خودکار MCQ و دستی تشریحی | پیاده |
| FR06 | پیشنهاد و مسیر یادگیری | پیاده |
| FR07 | داشبورد شهروند/مدرس | پیاده |
| FR08 | شاخص ترک برای ادمین | پیاده |
| FR09 | قانون ۳۰ روزه ترک‌کرده | پیاده |
| FR10 | پیش‌بینی ML در API | پیاده‌نشده |
| FR11 | جستجو/مرتب‌سازی الگوریتمی در لیست آزمون API | پیاده‌سازی‌شده (`StudentTestListView` + UI) |

## ۳٫۶ نیازمندی‌های غیرکارکردی

| شناسه | نیازمندی | شواهد |
|-------|----------|--------|
| NFR01 | احراز هویت توکنی | SimpleJWT |
| NFR02 | تفکیک دسترسی نقش‌محور | permissions + route guards |
| NFR03 | CORS برای فرانت | django-cors-headers |
| NFR04 | قابلیت آزمون‌پذیری الگوریتم‌ها | ۳۷۶ تست |
| NFR05 | پیکربندی محیطی DB | `.env` |

## ۳٫۷ معماری کلی

**شکل ۳‑۱ — معماری سامانه**

```mermaid
flowchart TB
  subgraph Client["فرانت‌اند فعال - cognitive-frontend"]
    UI[React Pages + AppShell]
    AuthCtx[AuthContext JWT]
    Hooks[useAssessment / useAdaptive / useAnalytics]
  end

  subgraph API["بک‌اند - coglearning Django REST"]
    Acc[accounts]
    Asmt[assessment]
    Adp[adaptive_learning]
    Anl[analytics]
  end

  subgraph Data["داده‌ها"]
    PG[(PostgreSQL ctlg)]
  end

  subgraph Algos["الگوریتم کاتالوگ"]
    ALG[coglearning/algorithms process_catalog]
    SIL[silver_project tests + mutants]
  end

  subgraph Side["لایه جانبی / زنده ML"]
    ML[scripts/train_abandonment_model.py + joblib آفلاین]
    MLE[ml_engine: /api/ml/churn/]
  end

  UI --> AuthCtx --> Hooks --> Acc & Asmt & Adp & Anl
  Acc & Asmt & Adp & Anl --> PG
  Asmt --> ALG
  SIL -. "سوئیت pytest / mutation" .-> ALG
  ML -. "مطالعه آفلاین (چهار ویژگی)" .-> Anl
  MLE --> UI
```

## ۳٫۸ گردش کلی پلتفرم

**شکل ۳‑۲ — گردش کلی**

```mermaid
flowchart TD
  A[ثبت‌نام / ورود JWT] --> B{نقش؟}
  B -->|teacher/admin| T[داشبورد مدرس / ادمین]
  B -->|student| C{تعیین سطح انجام شده؟}
  C -->|خیر| D[آزمون placement]
  D --> E[ثبت سطح شناختی]
  C -->|بله| F[داشبورد شهروند]
  E --> F
  F --> G[آزمون‌ها / مسیر یادگیری / پیشنهادها]
  G --> H[به‌روزرسانی خلاصه عملکرد]
  H --> I[ارزیابی ترک‌کرده ۳۰ روزه]
  T --> J[مدیریت محتوا و آزمون و تصحیح]
  T --> K[engagement-metrics برای admin]
```

## ۳٫۹ گردش‌کار داشبوردها

### ۳٫۹٫۱ داشبورد شهروند

**ورودی:** توکن کاربر، داده‌های خلاصه عملکرد، مسیر، پیشنهاد، تاریخچه  
**API:** `GET /api/analytics/student-dashboard/`  
**خروجی:** سطح، رتبه، هشدارها، پیشنهادها، هم‌دوره‌ای‌ها  

**شکل ۳‑۳**

```mermaid
sequenceDiagram
  participant U as شهروند
  participant FE as StudentDashboard.jsx
  participant API as StudentDashboardView
  participant S as AnalyticsService
  participant DB as PostgreSQL

  U->>FE: باز کردن /student/dashboard
  FE->>API: GET /analytics/student-dashboard/
  API->>S: update_user_performance_summary
  S->>DB: خواندن/نوشتن خلاصه + ترک‌کرده
  API->>DB: مسیر، پیشنهاد، آزمون‌های اخیر، peer cohort
  API-->>FE: JSON داشبورد
  FE-->>U: نمایش کارت‌ها و جداول
```

### ۳٫۹٫۲ داشبورد مدرس

**API:** `GET /api/analytics/teacher-dashboard/`  
**خروجی:** تعداد محتوا، آزمون، موارد pending_review  

**شکل ۳‑۴**

```mermaid
flowchart LR
  A[ورود مدرس] --> B[TeacherDashboard]
  B --> C[fetchTeacherDashboard]
  C --> D[شمارش محتوا/آزمون/تصحیح]
  D --> E[لینک‌های سریع مدیریت]
  B --> F[گزارش یک دانشجو با student_id]
```

### ۳٫۹٫۳ داشبورد engagement ادمین

**API:** `GET /api/analytics/engagement-metrics/`  
**خروجی:** جدول شهروندان + قانون ۳۰ روزه  

**شکل ۳‑۵**

```mermaid
flowchart TD
  A[admin] --> B[AdminEngagementPage]
  B --> C[engagement-metrics]
  C --> D[برای هر دانشجو evaluate_abandonment]
  D --> E[KPI: کل / فعال / ترک‌کرده]
  E --> F[جدول فیلدهای CSV]
```

## ۳٫۱۰ نمودار Use Case

**شکل ۳‑۶**

```mermaid
flowchart TB
  subgraph Actors
    ST[شهروند]
    TE[مدرس]
    AD[مدیر]
  end

  subgraph System["سامانه سنجش شناختی"]
    UC1((ثبت‌نام/ورود))
    UC2((تعیین سطح))
    UC3((شرکت در آزمون))
    UC4((مشاهده مسیر یادگیری))
    UC5((مشاهده داشبورد))
    UC6((مدیریت محتوا))
    UC7((مدیریت آزمون/سؤال))
    UC8((تصحیح تشریحی))
    UC9((مشاهده engagement))
  end

  ST --> UC1 & UC2 & UC3 & UC4 & UC5
  TE --> UC1 & UC6 & UC7 & UC8 & UC5
  AD --> UC1 & UC9 & UC5
  UC3 -.->|include| UC1
  UC4 -.->|extend| UC2
```

## ۳٫۱۱ طراحی پایگاه داده (ER)

**شکل ۳‑۷**

```mermaid
erDiagram
  USER ||--o{ COGNITIVE_TEST : creates
  USER ||--o{ TEST_SESSION : takes
  USER ||--o{ LEARNING_CONTENT : authors
  USER ||--o| USER_PERFORMANCE_SUMMARY : has
  USER ||--o{ LEVEL_HISTORY : has
  USER ||--o{ LEARNING_PATH : owns
  USER ||--o{ USER_CONTENT_PROGRESS : tracks
  USER ||--o{ CONTENT_RECOMMENDATION : receives
  USER ||--o{ USER_ABANDONMENT_SAMPLE : optional

  LEARNING_CONTENT ||--o| COGNITIVE_TEST : related_content
  COGNITIVE_TEST ||--o{ QUESTION : contains
  QUESTION ||--o{ CHOICE : has
  TEST_SESSION ||--o{ ANSWER : contains
  QUESTION ||--o{ ANSWER : answered_in
  LEARNING_PATH ||--o{ LEARNING_PATH_ITEM : contains
  LEARNING_CONTENT ||--o{ LEARNING_PATH_ITEM : referenced
  TEST_SESSION ||--o{ LEVEL_HISTORY : may_trigger
```

## ۳٫۱۲ نمودار کلاس (خلاصه سرویس‌محور)

**شکل ۳‑۸**

```mermaid
classDiagram
  class User {
    +role
    +cognitive_level
    +has_taken_placement_test
  }
  class AssessmentService {
    +calculate_auto_score()
    +process_test_completion()
    +apply_level_logic()
  }
  class AdaptiveLearningEngine {
    +generate_recommendations()
    +create_or_refresh_path()
  }
  class AnalyticsService {
    +record_login()
    +evaluate_abandonment()
    +update_user_performance_summary()
    +get_peer_cohort()
  }
  class CognitiveTest
  class TestSession
  class LearningContent
  class UserPerformanceSummary

  User --> TestSession
  User --> UserPerformanceSummary
  AssessmentService --> TestSession
  AssessmentService --> User
  AdaptiveLearningEngine --> LearningContent
  AnalyticsService --> UserPerformanceSummary
```

## ۳٫۱۳ نمودارهای توالی منتخب

### ورود

**شکل ۳‑۹**

```mermaid
sequenceDiagram
  participant U as کاربر
  participant FE as AuthContext
  participant LV as LoginView
  participant AS as AnalyticsService
  participant DB as DB

  U->>FE: username/password
  FE->>LV: POST /accounts/login/
  LV->>DB: اعتبارسنجی
  LV->>AS: record_login
  AS->>DB: به‌روز فاصله ورود + abandoned=False
  LV-->>FE: access + refresh
  FE->>FE: ذخیره localStorage
  FE->>DB: GET /accounts/profile/
```

### شرکت در آزمون

**شکل ۳‑۱۰**

```mermaid
sequenceDiagram
  participant U as شهروند
  participant FE as TestTaking
  participant API as assessment views
  participant Svc as AssessmentService
  participant DB as DB

  U->>FE: شروع آزمون
  FE->>API: POST tests/id/start/
  API->>DB: ایجاد TestSession
  loop هر سؤال
    U->>FE: پاسخ
    FE->>API: POST answer
    API->>DB: Answer update_or_create
  end
  U->>FE: پایان
  FE->>API: POST finish
  API->>Svc: process_test_completion
  Svc->>DB: نمره، سطح، analytics، پیشرفت محتوا
```

### پیش‌بینی ترک (وضعیت واقعی)

**شکل ۳‑۱۱ — تمایز قانون و ML**

```mermaid
flowchart TD
  A[فعالیت کاربر] --> B[محاسبه days_since_last_entry]
  B --> C{>= 30 روز؟}
  C -->|بله| D[abandoned=True و is_active=False]
  C -->|خیر| E[abandoned=False]
  F[CSV ویژگی‌ها] --> G[train_abandonment_model.py]
  G --> H[abandonment_predictor.joblib]
  H -. "در API لود نمی‌شود" .-> I[بدون risk score در UI]
  D --> J[نمایش در AdminEngagementPage]
  E --> J
```

## ۳٫۱۴ نمودار فعالیت — پایان آزمون

**شکل ۳‑۱۲**

```mermaid
flowchart TD
  A[finish_test_session] --> B[calculate_auto_score برای MCQ]
  B --> C{سؤال تشریحی دارد؟}
  C -->|بله| D[status=pending_review]
  C -->|خیر| E[status=completed]
  E --> F[apply_level_logic]
  E --> G[update_analytics_profile]
  E --> H[mark_content_completed اگر content_based و نمره≥80]
  D --> I[انتظار تصحیح مدرس]
  I --> J[submit_manual_grade]
  J --> F
```

## ۳٫۱۵ DFD سطح ۰

**شکل ۳‑۱۳**

```mermaid
flowchart LR
  ST[شهروند] --> SYS[سامانه سنجش شناختی]
  TE[مدرس] --> SYS
  AD[مدیر] --> SYS
  SYS --> DB[(پایگاه داده)]
  SYS --> ST
  SYS --> TE
  SYS --> AD
```

## ۳٫۱۶ تا ۳٫۲۱ طراحی ماژول‌ها

### ارزیابی
مدل‌های CognitiveTest/Question/Choice/TestSession/Answer و سرویس نمره‌دهی/سطح.

### یادگیری تطبیقی
LearningContent، Path، Progress، Recommendation + AdaptiveLearningEngine.

### تحلیل رفتار
UserPerformanceSummary، LevelHistory، LearningAnalytics، peer cohort.

### بازخورد
`teacher_feedback` در مدل موجود است؛ در `submit_manual_grade` فعلاً ست نمی‌شود (محدودیت). alerts داشبورد برای ضعف مهارت‌ها تولید می‌شود.

### ترک سامانه
قانون ۳۰ روزه در `AnalyticsService.evaluate_abandonment`؛ مدل آفلاین چهارویژگی جدا؛ پیش‌بینی زنده در `ml_engine` (`/api/ml/churn/`).

## ۳٫۲۲ جمع‌بندی فصل

طراحی ارائه‌شده مستقیماً از ساختار کد استخراج شده و مرز اجزای جانبی (الگوریتم/ML) با خطوط نقطه‌چین مشخص شده است.
