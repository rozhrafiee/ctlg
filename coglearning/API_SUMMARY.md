این مستند، خلاصه‌ی نهایی و به‌روزرسانی شده‌ی تمام APIهای سامانه «سنجش شناختی شهروندان» بر اساس آخرین تغییرات (بازه سطح ۱-۱۰۰، تفکیک آزمون‌ها، و داشبوردهای تخصصی) است.

۱. احراز هویت و مدیریت کاربران (Accounts)
عملکرد	متد	آدرس (Endpoint)	منطق و ملاحظات
ثبت‌نام	POST	/api/accounts/register/	ایجاد کاربر با نقش (Citizen/Teacher)
ورود (Login)	POST	/api/accounts/login/	دریافت access و refresh توکن JWT
پروفایل من	GET	/api/accounts/profile/	نمایش سطح (۱-۱۰۰)، تاریخچه تغییر سطح و نقش
۲. مدیریت آزمون‌ها - پنل مسئول شهری (مدرس) (Assessment - Teacher)
عملکرد	متد	آدرس	ورودی کلیدی (JSON)
ایجاد آزمون تعیین سطح	POST	/api/assessment/teacher/tests/placement/create/	عنوان و زمان (نوع آزمون خودکار placement می‌شود)
ایجاد آزمون محتوایی	POST	/api/assessment/content/{id}/test/create/	اتصال مستقیم آزمون به یک محتوای آموزشی خاص
افزودن سوال	POST	/api/assessment/teacher/tests/{id}/questions/	شامل فیلد order (تکراری نباشد) و correct_text_answer
لیست انتظار تصحیح	GET	/api/assessment/teacher/reviews/pending/	جلساتی که سوال تشریحی دارند و تمام شده‌اند
تصحیح دستی	POST	/api/assessment/teacher/sessions/{id}/grade/	ثبت نمره تشریحی و اعمال نهایی ارتقای سطح ۱-۱۰۰
۳. فرآیند شرکت در آزمون - شهروند (Assessment - Citizen)
عملکرد	متد	آدرس	منطق و ملاحظات
لیست آزمون‌های مجاز	GET	/api/assessment/tests/	فیلتر سطح + کاتالوگ الگوریتمی؛ query: q, search_algo, sort_algo, sort_by, sort_order → {results, catalog_meta}
شروع آزمون	POST	/api/assessment/tests/{id}/start/	ایجاد سشن و ست کردن زمان انقضا (expires_at)
ثبت پاسخ	POST	/api/assessment/sessions/{id}/questions/{qid}/answer/	ثبت جواب تستی یا متنی + زمان صرف شده
پایان آزمون	POST	/api/assessment/sessions/{id}/finish/	محاسبه آنی نمره تستی و ارتقای خودکار سطح کاربر
کارنامه جزئی	GET	/api/assessment/student/results/{id}/	مشاهده نمره، جواب خود، و جواب صحیح (حتی تشریحی)
۴. محتوای آموزشی و انطباقی (Adaptive Learning)
عملکرد	متد	آدرس	منطق و ملاحظات
پیشنهادات هوشمند	GET	/api/adaptive-learning/recommended/	محتواهای بازه سطح کاربر (مثلاً سطح فعلی ± ۵)
مسیر یادگیری	GET	/api/adaptive-learning/learning-path/	نمایش دروس زنجیره‌ای و وضعیت قفل بودن آن‌ها
ثبت پیشرفت	POST	/api/adaptive-learning/content/{id}/progress/	ارسال درصد مطالعه (مثلاً ۱۰۰ برای تکمیل)
مدیریت محتوا (مسئول شهری/مدرس)	POST	/api/adaptive-learning/teacher/content/create/	تعیین بازه min_level و max_level برای محتوا
۵. تحلیل و داشبوردهای تخصصی (Analytics)
عملکرد	متد	آدرس	خروجی و کاربرد
داشبورد شهروند	GET	/api/analytics/student-dashboard/	سطح، رتبه، آمار راداری (حافظه/تمرکز/منطق)، پیشنهادات
داشبورد مسئول شهری (مدرس)	GET	/api/analytics/teacher-dashboard/	آمار محتواها، تعداد آزمون‌های در انتظار تصحیح
آمار شناختی من	GET	/api/analytics/my-stats/	تحلیل دقیق نمرات شناختی بر اساس دسته‌بندی سوالات
گزارش سیستم (ادمین)	GET	/api/analytics/system-report/	توزیع سطوح ۱-۱۰۰ در کل سامانه و آمار فعالیت‌ها
💡 نکات فنی برای پیاده‌سازی (Cheat Sheet):

امنیت سطح: تمام APIهای شهروند (بجز تعیین سطح) توسط پرمیشن HasTakenPlacementTest محافظت می‌شوند.

محاسبه سطح:

در آزمون تعیین سطح: سطح = نمره خام (مثلاً نمره ۷۲ می‌شود سطح ۷۲).

در آزمون معمولی: قبولی (نمره > passing_score) باعث ارتقای سطح (معمولاً +۲ تا +۵ پله) می‌شود.

سوالات تشریحی: بعد از پایان آزمون توسط شهروند، وضعیت سشن pending_review می‌ماند تا مسئول شهری (مدرس) نمره بدهد؛ پس از آن سطح کاربر آپدیت می‌شود.

زمان‌سنجی: در هر پاسخ (submit_answer)، فیلد time_spent_seconds ارسال می‌شود که در اپلیکیشن analytics برای سنجش سرعت پردازش ذهنی کاربر استفاده می‌گردد.

خطاهای رایج:

400 Bad Request: تکراری بودن order در سوالات یا گزینه‌ها.

403 Forbidden: تلاش شهروند برای دسترسی به محتوای بالاتر از سطح خود یا قبل از تعیین سطح.
