# فصل ۶ — پیش‌بینی ترک سامانه و یادگیری ماشین

## ۶٫۱ مقدمه

این فصل سه لایه متمایز را جدا می‌کند: (۱) قانون عملیاتی ترک‌کرده در پلتفرم، (۲) آموزش آفلاین مدل ML چهارویژگی، (۳) inference زنده در `ml_engine` برای ریسک ترک شهروند.

## ۶٫۲ تعریف مسئله ML

ورودی: چهار ویژگی رفتاری  
خروجی: ترک / عدم ترک (`abandoned`)

## ۶٫۳ دیتاست

- مسیر: `datasets/abandonment_training.csv`  
- تعداد: ۲۰۰۰ نمونه (+ هدر)  
- توزیع در نتایج فعلی: ۹۷۱ abandoned / ۱۰۲۹ retained  
- تولید: `seed_abandonment_dataset` با برچسب قطعی `avg_login_interval_days >= 30`

## ۶٫۴ ویژگی‌ها و متغیر هدف

مطابق فصل ۲ و مدل `UserAbandonmentSample` / فیلدهای `UserPerformanceSummary`.

## ۶٫۵ پیش‌پردازش

- تبدیل به float  
- StandardScaler فقط برای Logistic Regression  
- بدون imputation پیچیده  

## ۶٫۶ تقسیم داده

- Holdout 80/20 با stratify و `random_state=42`  
- CV سه‌لایه StratifiedKFold برای تنظیم  

## ۶٫۷ انتخاب و آموزش مدل

مدل‌های مقایسه‌شده:

1. LogisticRegression (balanced)  
2. RandomForest + GridSearch  
3. HistGradientBoosting + GridSearch  
4. CalibratedClassifierCV روی HGB  

معیار انتخاب ترکیبی: `0.55*F1 + 0.45*ROC_AUC` و تنظیم آستانه تصمیم.

## ۶٫۸ نتایج آزمایش (از `abandonment_model_results.json`)

| مدل | Accuracy | Precision | Recall | F1 | ROC-AUC |
|-----|---------:|----------:|-------:|---:|--------:|
| RandomForest_Tuned | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| HistGradientBoosting_Tuned | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| Calibrated_HGB | 0.9975 | 0.9949 | 1.000 | 0.9974 | 0.9976 |
| LogisticRegression | 0.9975 | 1.000 | 0.9948 | 0.9974 | 1.000 |

- مدل نهایی ذخیره‌شده: **RandomForest_Tuned**  
- آستانه: **۰٫۳۳**  
- Confusion Matrix: tn=206, fp=0, fn=0, tp=194  

**شکل ۶‑۱ — pipeline آموزش**

```mermaid
flowchart LR
  CSV[abandonment_training.csv] --> SPLIT[train_test_split 80/20]
  SPLIT --> TUNE[GridSearchCV]
  TUNE --> CMP[مقایسه مدل‌ها]
  CMP --> THR[تنظیم threshold]
  THR --> JOB[abandonment_predictor.joblib]
  THR --> JSON[abandonment_model_results.json]
```

## ۶٫۹ تفسیر علمی نتایج

نزدیک‌به‌کامل بودن متریک‌ها ناشی از **جداسازی قطعی کلاس‌ها بر اساس آستانه ۳۰ روی همان ویژگی فاصله ورود** است. بنابراین این نتایج را نباید به‌عنوان موفقیت پیش‌بینی زودهنگام تفسیر کرد. اهمیت جایگشتی نیز عمدتاً روی `avg_login_interval_days` متمرکز است.

> فایل `abandonment_model_summary.txt` نتایج قدیمی‌تری (حدود Accuracy 0.78) دارد و با JSON فعلی ناسازگار است؛ مرجع پایان‌نامه باید JSON/joblib هم‌زمان باشد.

## ۶٫۱۰ یکپارچه‌سازی با پلتفرم

| قابلیت | وضعیت |
|--------|--------|
| محاسبه فیلدهای engagement از فعالیت واقعی | پیاده |
| نمایش در `/admin/engagement` | پیاده |
| اعمال قانون ۳۰ روزه + deactivate | پیاده |
| `joblib.load` مدل آفلاین چهارویژگی در داشبورد ادمین | **نیست** |
| `joblib.load` + predict در `ml_engine` (`/api/ml/churn/`) | **هست** |
| نمایش اعلان/ریسک ماندگاری در UI شهروند | **هست** (`RetentionBanner`) |

**شکل ۶‑۲ — آنچه کاربر ادمین واقعاً می‌بیند (قانون ۳۰ روزه)**

```mermaid
flowchart TD
  A[AdminEngagementPage] --> B[engagement-metrics API]
  B --> C[evaluate_abandonment قانون ۳۰ روزه]
  C --> D[پرچم abandoned و is_active]
  D --> E[جدول ویژگی‌های CSV]
  F[مدل آفلاین joblib] -.->|بدون اتصال به ادمین| A
  G[ml_engine /api/ml/churn/] --> H[RetentionBanner شهروند]
```

## ۶٫۱۱ کاربرد عملی ایده‌آل (بخشی آینده)

مدل زنده شهروند برای هشدار ماندگاری متصل است. اتصال مدل آفلاین چهارویژگی به داشبورد ادمین، مداخله شخصی‌سازی‌شده گسترده‌تر و اعلان Email/Push همچنان Future Work هستند.

## ۶٫۱۲ تا ۶٫۱۶ بحث و جمع‌بندی

دستاورد فصل: تعریف شفاف لایه‌های ترک، وجود داده و مدل آموزش‌دیده آفلاین، یکپارچگی عملیاتی قانون ۳۰ روزه، و inference زنده در `ml_engine`.  
محدودیت اصلی: برچسب‌گذاری تقریباً deterministic در CSV آفلاین که ارزیابی پیش‌بینی را متورم می‌کند؛ و نبود اتصال مدل آفلاین به UI ادمین.
