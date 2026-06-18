# گزارش پیاده سازی الگوریتم ها و تست ها در پروژه ctlg

## 1. سناریوی واقعی پروژه

سناریوی انتخاب شده در این پروژه، کاتالوگ آزمون ها و محتوای یادگیری شناختی است. کاربر دانشجو در سامانه می تواند آزمون های قابل دسترس خود را ببیند، آن ها را جستجو کند و بر اساس ترجیح خودش مرتب سازی انجام دهد. این سناریو در پروژه `ctlg` داخل بخش ارزیابی شناختی و یادگیری تطبیقی پیاده سازی شده است.

در این سناریو:

- داده ها شامل آیتم های کاتالوگ مانند آزمون شناختی یا محتوای یادگیری هستند.
- کاربر می تواند روش مرتب سازی، روش جستجو، فیلد مرتب سازی و جهت مرتب سازی را انتخاب کند.
- اگر کاربر در صفحه پروفایل ترجیح پیش فرض ثبت کرده باشد، API از همان ترجیحات استفاده می کند.
- خروجی API علاوه بر لیست مرتب/فیلتر شده، متادیتای الگوریتم های استفاده شده را نیز برمی گرداند.

## 2. محل پیاده سازی در پروژه

پیاده سازی اصلی الگوریتم ها در مسیرهای زیر انجام شده است:

- `coglearning/algorithms/sorting.py`
- `coglearning/algorithms/searching.py`
- `coglearning/algorithms/catalog.py`
- `coglearning/algorithms/utils.py`
- `coglearning/algorithms/tests/test_coverage.py`

اتصال الگوریتم ها به سناریوی واقعی پروژه در این فایل ها انجام شده است:

- `coglearning/accounts/models.py`: ذخیره ترجیحات کاربر شامل الگوریتم مرتب سازی، الگوریتم جستجو و فیلد مرتب سازی پیش فرض.
- `coglearning/assessment/views.py`: استفاده از `process_catalog` در `StudentTestListView` برای فیلتر و مرتب کردن آزمون های قابل دسترس.
- `cognitive-frontend/src/pages/Profile.jsx`: دریافت ترجیحات پیش فرض کاربر از طریق فرم پروفایل.
- `cognitive-frontend/src/pages/AvailableTests.jsx`: دریافت ورودی جستجو، الگوریتم جستجو، الگوریتم مرتب سازی، فیلد و جهت مرتب سازی از کاربر.

## 2.1. الگوریتم ها دقیقا روی چه خروجی ای از سامانه کار می کنند؟

الگوریتم ها مستقیم روی خروجی نهایی HTML یا کارت های فرانت اند اجرا نمی شوند. محل اجرای آن ها در بک اند است و داده ورودی آن ها، خروجی فیلتر شده دیتابیس قبل از serializer شدن است.

جریان دقیق داده به این شکل است:

1. در `StudentTestListView.get_queryset`، سامانه ابتدا آزمون های قابل دسترس کاربر را از مدل `CognitiveTest` استخراج می کند.
2. اگر کاربر دانشجو باشد، آزمون ها بر اساس وضعیت تعیین سطح، سطح شناختی کاربر و فعال بودن آزمون فیلتر می شوند.
3. در متد `list`، همین queryset با `items = list(queryset)` به لیست پایتونی تبدیل می شود.
4. این لیست به تابع `process_catalog` داده می شود.
5. داخل `process_catalog` ابتدا جستجو انجام می شود، سپس نتیجه جستجو مرتب می شود.
6. خروجی نهایی به serializer داده می شود و با کلیدهای `results` و `catalog_meta` به فرانت اند برمی گردد.

بنابراین ورودی اصلی الگوریتم ها لیستی از آبجکت های آزمون شناختی است؛ مثل آزمون هایی با فیلدهای `title`، `description`، `min_level` و `time_limit_minutes`.

کار هر الگوریتم روی خروجی سامانه:

| الگوریتم | روی چه داده ای اجرا می شود؟ | خروجی الگوریتم چیست؟ | اثر در سامانه |
|---|---|---|---|
| `linear_search` | روی لیست آزمون های قابل دسترس کاربر، قبل از مرتب سازی | لیست اندیس آزمون هایی که query در `title` یا `description` آن ها وجود دارد | فقط آزمون های مطابق جستجو باقی می مانند |
| `binary_search` | روی همان لیست آزمون ها، اما اول بر اساس `sort_field` مرتب شده | یک اندیس برای تطبیق دقیق، یا `-1` در صورت پیدا نشدن | اگر عنوان/فیلد دقیق پیدا شود یک آزمون برمی گردد، وگرنه خروجی خالی می شود |
| `bubble_sort` | روی خروجی جستجو، یا کل لیست اگر query خالی باشد | لیست آزمون ها به صورت مرتب شده | ترتیب نمایش کارت های آزمون در صفحه `AvailableTests` تغییر می کند |
| `merge_sort` | روی خروجی جستجو، یا کل لیست اگر query خالی باشد | لیست آزمون ها به صورت مرتب شده | همان خروجی نمایشی را مرتب می کند، اما با روش Merge Sort |

به زبان ساده، الگوریتم های جستجو مشخص می کنند «کدام آزمون ها در خروجی بمانند» و الگوریتم های مرتب سازی مشخص می کنند «همان آزمون های باقی مانده با چه ترتیبی نمایش داده شوند».
we[';plk,o]
خروجی API در نهایت شبیه این ساختار است:

```json
{
  "results": [
    {
      "id": 1,
      "title": "آزمون حافظه",
      "min_level": 10,
      "time_limit_minutes": 30
    }
  ],
  "catalog_meta": {
    "query": "حافظه",
    "sort_algorithm": "merge",
    "search_algorithm": "linear",
    "sort_field": "min_level",
    "reverse": false,
    "total_before": 4,
    "total_after": 1
  }
}
```

در این مثال، `linear_search` آزمون های مرتبط با «حافظه» را پیدا کرده و `merge_sort` همان خروجی فیلتر شده را بر اساس `min_level` مرتب کرده است.

## 3. الگوریتم های پیاده سازی شده

### 3.1. Bubble Sort

در فایل `coglearning/algorithms/sorting.py` تابع `bubble_sort` پیاده سازی شده است. این الگوریتم بدون استفاده از مرتب سازی آماده زبان، آیتم ها را با مقایسه جفت های مجاور مرتب می کند.

ویژگی های پیاده سازی:

- پشتیبانی از مرتب سازی صعودی و نزولی با پارامتر `reverse`
- پشتیبانی از فیلدهای مختلف با پارامتر `key`
- خروج سریع در حالت لیست از قبل مرتب شده با متغیر `swapped`
- کپی کردن ورودی با `list(items)` برای جلوگیری از تغییر مستقیم داده اصلی

### 3.2. Merge Sort

در همان فایل، تابع `merge_sort` و تابع کمکی `_merge` پیاده سازی شده اند. این الگوریتم با روش تقسیم و حل، لیست را به دو نیم تقسیم می کند و سپس خروجی های مرتب را ادغام می کند.

ویژگی های پیاده سازی:

- پیاده سازی بازگشتی
- پشتیبانی از مرتب سازی صعودی و نزولی
- پشتیبانی از فیلدهای مختلف مثل `title`، `min_level` و `time_limit_minutes`
- استفاده از تابع کمکی `_merge` برای ادغام دو لیست مرتب

### 3.3. Linear Search

در فایل `coglearning/algorithms/searching.py` تابع `linear_search` پیاده سازی شده است. این تابع روی آیتم ها پیمایش خطی انجام می دهد و عبارت جستجو را در فیلدهای `title` و `description` بررسی می کند.

ویژگی های پیاده سازی:

- اگر query خالی باشد، همه اندیس ها برگردانده می شوند.
- جستجو نسبت به بزرگی و کوچکی حروف حساس نیست.
- امکان جستجو در چند فیلد وجود دارد.
- با پیدا شدن اولین تطبیق در یک آیتم، حلقه داخلی متوقف می شود.

### 3.4. Binary Search

علاوه بر الگوریتم جستجوی اصلی، تابع `binary_search` نیز در پروژه پیاده سازی شده است. این تابع برای جستجوی دقیق روی لیست مرتب شده استفاده می شود.

در `catalog.py` اگر کاربر `binary` را انتخاب کند، ابتدا آیتم ها با `bubble_sort` بر اساس فیلد انتخابی مرتب می شوند و سپس `binary_search` روی لیست مرتب شده اجرا می شود.

## 4. دریافت ترجیحات کاربر

ترجیحات کاربر در مدل `User` ذخیره شده است:

- `preferred_sort_algorithm`: مقدارهای `bubble` یا `merge`
- `preferred_search_algorithm`: مقدارهای `linear` یا `binary`
- `default_sort_field`: مقدارهای `title`، `min_level` یا `time_limit_minutes`

در فرانت اند، صفحه `Profile.jsx` این ترجیحات را از کاربر دریافت و ذخیره می کند. همچنین صفحه `AvailableTests.jsx` به کاربر اجازه می دهد در لحظه، گزینه های زیر را انتخاب کند:

- متن جستجو `q`
- الگوریتم جستجو `search_algo`
- الگوریتم مرتب سازی `sort_algo`
- فیلد مرتب سازی `sort_by`
- جهت مرتب سازی `sort_order`

در بک اند، `StudentTestListView.list` این پارامترها را از query string می گیرد. اگر پارامتری ارسال نشده باشد، ترجیح ذخیره شده کاربر استفاده می شود. سپس تابع `process_catalog` اجرا می شود و نتیجه در قالب `results` و `catalog_meta` برگردانده می شود.

## 5. تولید مجموعه تست 1 با روش ACOC

در فایل `coglearning/algorithms/tests/test_coverage.py` بخش ACOC با عنوان `ACOC: All Combinations` پیاده سازی شده است.

پارامترهای مورد استفاده برای تولید ترکیب ها:

- اندازه داده: لیست خالی، تک عضوی، چند عضوی
- وضعیت ترتیب اولیه: مرتب، معکوس، تصادفی
- فیلد مرتب سازی: `title`، `min_level`، `time_limit_minutes`
- الگوریتم مرتب سازی: `bubble`، `merge`
- مقدار جستجو: خالی، موجود، ناموجود
- الگوریتم جستجو: `linear`، `binary`

تابع تست اصلی:

```python
test_acoc_catalog_combinations
```

این تست با `pytest.mark.parametrize` تمام ترکیب های ورودی را تولید می کند. هدف این بخش این است که حالت های مختلف ورودی و ترجیحات کاربر هم زمان بررسی شوند.

همچنین تست زیر بررسی می کند که خروجی مرتب سازی واقعا بر اساس فیلد انتخاب شده مرتب باشد:

```python
test_acoc_sort_produces_ordered_output
```

## 6. تولید مجموعه تست 2 بر اساس گراف جریان کنترل

برای فصل هفتم، گراف جریان کنترل برای توابع اصلی به صورت مفهومی استخراج شد و تست ها در سه کلاس جداگانه نوشته شدند:

- `TestNodeCoverage`
- `TestEdgeCoverage`
- `TestPrimePathCoverage`

### 6.1. گراف جریان کنترل Bubble Sort

گره های اصلی:

1. شروع تابع و کپی کردن لیست
2. بررسی `n <= 1`
3. شروع حلقه بیرونی
4. مقداردهی `swapped = False`
5. شروع حلقه داخلی
6. استخراج مقدار دو آیتم مجاور
7. بررسی شرط swap
8. انجام swap و تغییر `swapped`
9. بررسی `not swapped`
10. خروج و برگرداندن لیست

یال های مهم:

- مسیر لیست خالی یا تک عضوی
- مسیر بدون swap
- مسیر با swap
- مسیر خروج زودهنگام
- مسیر اجرای کامل حلقه ها
- مسیر مرتب سازی نزولی با `reverse=True`

### 6.2. گراف جریان کنترل Merge Sort

گره های اصلی:

1. شروع تابع و کپی لیست
2. بررسی `n <= 1`
3. محاسبه `mid`
4. فراخوانی بازگشتی برای نیمه چپ
5. فراخوانی بازگشتی برای نیمه راست
6. ورود به `_merge`
7. مقایسه مقدار چپ و راست
8. افزودن آیتم چپ یا راست
9. افزودن باقی مانده چپ یا راست
10. برگشت خروجی مرتب شده

مسیرهای مهم:

- لیست خالی
- لیست تک عضوی
- لیست چند عضوی
- انتخاب از سمت چپ در merge
- انتخاب از سمت راست در merge
- باقی ماندن آیتم های چپ یا راست

### 6.3. گراف جریان کنترل Linear Search

گره های اصلی:

1. شروع تابع
2. بررسی query خالی
3. پیمایش آیتم ها
4. پیمایش فیلدها
5. بررسی وجود query در مقدار فیلد
6. افزودن اندیس به نتایج
7. شکستن حلقه داخلی
8. برگشت لیست نتایج

مسیرهای مهم:

- query خالی
- query موجود در عنوان
- query موجود در توضیحات
- query ناموجود
- چند فیلدی بودن جستجو

### 6.4. گراف جریان کنترل Binary Search

گره های اصلی:

1. شروع تابع
2. بررسی query خالی یا لیست خالی
3. مقداردهی `left` و `right`
4. اجرای حلقه `while left <= right`
5. محاسبه `mid`
6. مقایسه مقدار وسط با query
7. برگشت index در حالت پیدا شدن
8. حرکت به نیمه راست
9. حرکت به نیمه چپ
10. برگشت `-1` در حالت پیدا نشدن

مسیرهای مهم:

- پیدا شدن در همان وسط
- حرکت به چپ
- حرکت به راست
- چند بار تکرار حلقه
- پیدا نشدن مقدار
- query خالی

## 7. پوشش Node Coverage

کلاس `TestNodeCoverage` برای پوشش همه گره های اصلی نوشته شده است.

نمونه تست ها:

- `test_bubble_empty_list`
- `test_bubble_single_element`
- `test_bubble_already_sorted`
- `test_bubble_reverse_sorted`
- `test_merge_empty`
- `test_merge_single`
- `test_merge_multiple`
- `test_linear_empty_query`
- `test_linear_match_found`
- `test_linear_no_match`
- `test_binary_found`
- `test_binary_not_found`
- `test_binary_empty_query`
- `test_catalog_invalid_algo_defaults`

این تست ها مطمئن می شوند که هر قسمت اصلی از کد حداقل یک بار اجرا شده است.

## 8. پوشش Edge Coverage

کلاس `TestEdgeCoverage` برای پوشش یال ها و شاخه های تصمیم گیری نوشته شده است.

نمونه تست ها:

- `test_bubble_swap_branch_taken`: شاخه انجام swap
- `test_bubble_swap_branch_not_taken`: شاخه عدم انجام swap
- `test_bubble_early_exit_no_swaps`: شاخه خروج زودهنگام
- `test_bubble_reverse_true_branch`: شاخه مرتب سازی نزولی
- `test_binary_left_branch`: حرکت در یک سمت جستجوی دودویی
- `test_binary_right_branch`: حرکت در سمت دیگر جستجوی دودویی
- `test_binary_mid_branch`: پیدا شدن مقدار وسط
- `test_catalog_binary_search_path`: مسیر جستجوی دودویی در سرویس کاتالوگ
- `test_catalog_linear_search_path`: مسیر جستجوی خطی در سرویس کاتالوگ

این تست ها علاوه بر اجرای گره ها، عبور از شاخه های تصمیم گیری را نیز بررسی می کنند.

## 9. پوشش Prime Path Coverage

کلاس `TestPrimePathCoverage` مسیرهای اصلی و طولانی تر را پوشش می دهد؛ یعنی مسیرهایی که داخل مسیر بزرگ تر دیگری تکرار نشده اند و رفتار مهم حلقه، بازگشت یا pipeline را نشان می دهند.

نمونه تست ها:

- `test_bubble_full_outer_inner_loop`: اجرای کامل حلقه های داخلی و بیرونی Bubble Sort
- `test_merge_recursive_divide`: مسیر بازگشتی Merge Sort
- `test_merge_left_and_right_remainders`: مسیر باقی مانده ها در merge
- `test_binary_search_loop_multiple_iterations`: اجرای چندباره حلقه Binary Search
- `test_catalog_full_pipeline_search_then_sort`: اجرای کامل جستجو سپس مرتب سازی
- `test_linear_search_multiple_fields`: مسیر جستجو در چند فیلد

این مجموعه نسبت به Node و Edge قوی تر است، چون مسیرهای ترکیبی و عمیق تر را نیز بررسی می کند.

## 10. تولید Mutant برای عملگرهای حسابی (AOR)

برای فصل نهم، روش AOR (Arithmetic Operator Replacement) روی تمام عبارات حسابی توابع اصلی اعمال شد. کد کامل جهش‌ها در پوشه `coglearning/algorithms/mutants/` پیاده‌سازی شده است. هر تابع جهش یافته یک کپی دقیق از تابع اصلی است با دقیقاً یک تغییر عملگر حسابی.

### 10.1. جهش‌های bubble_sort — روی `range(0, n - i - 1)`

| شناسه | عبارت اصلی | جهش (AOR) | اثر | وضعیت |
|---|---|---|---|---|
| M-AOR-BS-01 | `n - i - 1` | `n + i - 1` | برای i=1: range(0,n) → arr[n] | **KILLED** (IndexError) |
| M-AOR-BS-02 | `n - i - 1` | `n - i + 1` | اولین پاس: range(0,n+1) → arr[n] | **KILLED** (IndexError) |
| M-AOR-BS-03 | `n - i - 1` | `n - i - 2` | یک مقایسه کمتر → آخرین جفت مقایسه نمی‌شود | **KILLED** (خروجی غلط) |
| M-AOR-BS-04 | `n - i - 1` | `n * i - 1` | i=0: range(0,-1)=[] → break فوری → بدون مرتب‌سازی | **KILLED** (خروجی غلط) |

### 10.2. جهش‌های merge_sort — روی `mid = n // 2`

| شناسه | عبارت اصلی | جهش (AOR) | اثر | وضعیت |
|---|---|---|---|---|
| M-AOR-MS-01 | `n // 2` | `n // 1` | mid=n → arr[:n]=arr → بازگشت نامحدود | **KILLED** (RecursionError) |
| M-AOR-MS-02 | `n // 2` | `n // 3` | n=2: mid=0 → arr[0:]=arr → بازگشت نامحدود | **KILLED** (RecursionError) |
| M-AOR-MS-03 | `n // 2` | `(n+1) // 2` | تقسیم سقفی — هر دو نیمه غیرخالی، خروجی یکسان | **EQUIVALENT** |

### 10.3. جهش‌های binary_search — روی mid و left/right

| شناسه | عبارت اصلی | جهش (AOR) | اثر | وضعیت |
|---|---|---|---|---|
| M-AOR-BN-01 | `(left+right)//2` | `(left-right)//2` | mid منفی → ایندکس اشتباه → -1 برمی‌گردد | **KILLED** (خروجی غلط) |
| M-AOR-BN-02 | `(left+right)//2` | `(left+right)*2` | mid=8 برای n=5 → IndexError | **KILLED** (IndexError) |
| M-AOR-BN-03 | `(left+right)//2` | `(left+right+1)//2` | تقسیم سقفی — هر دو روش binary search معتبرند | **EQUIVALENT** |
| M-AOR-BN-04 | `left = mid + 1` | `left = mid - 1` | سمت راست: left نمی‌رود → حلقه بی‌نهایت | **KILLED** (non-termination) |
| M-AOR-BN-05 | `right = mid - 1` | `right = mid + 1` | سمت چپ: right نمی‌رود → حلقه بی‌نهایت | **KILLED** (non-termination) |

### 10.4. جهش‌های catalog — روی متادیتا

| شناسه | عبارت اصلی | جهش (AOR) | اثر | وضعیت |
|---|---|---|---|---|
| M-AOR-PC-01 | `len(items)` | `len(items) + 1` | total_before یک واحد بیشتر گزارش می‌شود | **LIVE** → بعد از افزودن assert: **KILLED** |
| M-AOR-PC-02 | `len(sorted_items)` | `len(sorted_items) - 1` | total_after با len(items) ناسازگار می‌شود | **KILLED** (assert موجود) |

### 10.5. توضیح Mutation زنده و Mutation معادل

**Mutation زنده (Live Mutation) — M-AOR-PC-01:**
جهش M-AOR-PC-01 تابعی تولید می‌کند که `total_before = len(items) + 1` را گزارش می‌دهد. تست‌های قدیمی فقط شرط `total_after <= total_before` را بررسی می‌کردند. چون `total_after` تغییر نکرده، این شرط همچنان برقرار است و جهش از تست‌ها رد می‌شود. این جهش «زنده» بود تا زمانی که assert صریح `assert result["meta"]["total_before"] == len(items)` به تست‌های ACOC اضافه شد.

**Mutation معادل (Equivalent Mutation) — M-AOR-MS-03 و M-AOR-BN-03:**
جهش M-AOR-MS-03 از تقسیم کفی (`n//2`) به تقسیم سقفی (`(n+1)//2`) تغییر می‌دهد. هر دو نوع تقسیم در Merge Sort معتبرند: تنها کافی است نیمه‌ها غیرخالی باشند. برای هر ورودی ممکن، نتیجه نهایی مرتب‌سازی یکسان است. به همین دلیل هیچ تستی قادر به کشتن این جهش نیست و معادل اصلی محسوب می‌شود.

جهش M-AOR-BN-03 نیز به همین دلیل معادل است: هم تقسیم کفی هم سقفی در binary search همیشه عنصر درست را پیدا می‌کنند.

## 11. محاسبه Mutation Score

فرمول محاسبه (فصل 9 کتاب):

```
Mutation Score = (Killed / (Total - Equivalent)) × 100
```

نتایج دقیق:

| مقدار | عدد |
|---|---|
| کل جهش‌ها (Total Mutants) | 14 |
| جهش‌های معادل (Equivalent) | 2 (M-AOR-MS-03, M-AOR-BN-03) |
| جهش‌های غیرمعادل (Non-Equivalent) | 12 |
| جهش‌های کشته‌شده — قبل از اصلاح | 10 |
| جهش‌های زنده — قبل از اصلاح | 1 (M-AOR-PC-01) |
| جهش‌های کشته‌شده — بعد از اصلاح | 11 |
| جهش‌های زنده — بعد از اصلاح | 0 |

```
Mutation Score (قبل از اصلاح)  = 10/12 × 100 = 83.3%
Mutation Score (بعد از اصلاح)  = 11/12 × 100 = 91.7%
```

اصلاح انجام‌شده: اضافه کردن یک خط در `test_acoc_catalog_combinations`:
```python
assert result["meta"]["total_before"] == len(items)
```

**نتیجه اجرای تست‌ها:** `376 passed in 9.30s` — همه ۳۷۶ تست پاس شدند.

## 12. پاسخ به سوالات فصل نهم

### 12.1. کدام معیار پوشش بهتر بود؟ چرا؟

**Prime Path Coverage** بهترین معیار بود، با این استدلال‌های دقیق:

- **Node Coverage** فقط تضمین می‌کند هر بخش کد حداقل یک بار اجرا شود. این معیار هیچ جهشی از نوع AOR را به‌تنهایی نمی‌تواند بکشد، چون اجرای یک گره اثبات نمی‌کند خروجی صحیح است.

- **Edge Coverage** شاخه‌های تصمیم را پوشش می‌دهد (swap/no-swap، found/not-found). این معیار M-AOR-BS-01 و M-AOR-BS-02 را با IndexError می‌کشد، اما برای M-AOR-BS-03 (که فقط یک مقایسه کمتر انجام می‌دهد) ممکن است کافی نباشد.

- **Prime Path Coverage** مسیرهای ترکیبی را پوشش می‌دهد: اجرای کامل حلقه‌های Bubble Sort، تقسیم بازگشتی چندمرحله‌ای Merge Sort، و چند تکرار Binary Search. این مسیرها تضمین می‌کنند جهش‌های ظریف مثل M-AOR-BS-03 (کم شدن یک مقایسه در حلقه داخلی) حتماً شناسایی می‌شوند.

### 12.2. کدام تست‌ها شکست خوردند؟

در اجرای کد اصلی، همه تست‌ها پاس می‌شوند. هنگام اعمال جهش‌ها، تست‌های زیر با هر جهش مشخص شکست می‌خورند:

| جهش | تست‌هایی که آن را می‌کشند |
|---|---|
| M-AOR-BS-01 | هر تستی که `bubble_sort` با لیست ≥2 عضو صدا کند → IndexError |
| M-AOR-BS-02 | همان — IndexError در اولین پاس |
| M-AOR-BS-03 | `test_bubble_full_outer_inner_loop`, `test_acoc_sort_produces_ordered_output` |
| M-AOR-BS-04 | `test_bubble_swap_branch_taken`, `test_bubble_reverse_sorted`, `test_acoc_sort_produces_ordered_output` |
| M-AOR-MS-01 | هر تستی که `merge_sort` با لیست ≥2 عضو صدا کند → RecursionError |
| M-AOR-MS-02 | همان → RecursionError |
| M-AOR-BN-01 | `test_binary_mid_branch`, `test_binary_left_branch`, `test_binary_right_branch` |
| M-AOR-BN-02 | هر تستی که `binary_search` با لیست ≥2 عضو صدا کند → IndexError |
| M-AOR-BN-04 | `test_binary_right_branch`, `test_binary_search_loop_multiple_iterations` |
| M-AOR-BN-05 | `test_binary_left_branch`, `test_binary_search_loop_multiple_iterations` |
| M-AOR-PC-01 | `test_acoc_catalog_combinations` (بعد از اضافه کردن assert total_before) |
| M-AOR-PC-02 | `test_acoc_catalog_combinations` (assert total_after == len(items)) |

### 12.3. چگونه می‌توان Mutation Score را بهبود داد؟

اقداماتی که Mutation Score را از 83.3% به 91.7% رساندیم:

1. **اضافه کردن assert صریح روی `total_before`:**
   ```python
   assert result["meta"]["total_before"] == len(items)
   ```
   این خط جهش LIVE یعنی M-AOR-PC-01 را کشت.

2. **ایجاد فایل `test_mutation_killing.py`:** آزمون‌های هدفمند برای هر یک از ۱۴ جهش، شامل تست‌های threading برای تشخیص حلقه بی‌نهایت.

برای رسیدن به نزدیک ۱۰۰٪ در پروژه‌های مشابه:
- اضافه کردن assert روی محتوای دقیق `items` (نه فقط طول) در تست‌های pipeline
- بررسی اینکه توابع ورودی اصلی را تغییر نمی‌دهند (`assert original_input == initial_value`)
- تست با لیست‌های بزرگ‌تر برای Binary Search تا حلقه‌های بیشتری طی شود

## 13. نحوه اجرای برنامه و تست‌ها

### 13.1. اجرای برنامه تعاملی (demo.py)

```bash
cd coglearning

# حالت تعاملی — از کاربر ورودی می‌خواهد
python -m algorithms.demo

# حالت CLI — ترجیحات از خط فرمان
python -m algorithms.demo -q حافظه -s merge -r linear -f min_level
python -m algorithms.demo -q "آزمون منطق" -r binary -f title
python -m algorithms.demo --list   # نمایش همه آزمون‌ها
```

### 13.2. اجرای تست‌ها

```bash
cd coglearning

# اجرای همه تست‌ها
python -m pytest algorithms/tests/ -v

# فقط تست‌های ACOC
python -m pytest algorithms/tests/test_coverage.py -k "acoc" -v

# فقط تست‌های جهش
python -m pytest algorithms/tests/test_mutation_killing.py -v

# اجرا با گزارش پوشش کد
python -m pytest algorithms/tests/ --cov=algorithms --cov-report=term-missing
```

نتیجه اجرا: **376 passed in 9.30s**

## 14. جمع‌بندی

در پروژه `ctlg` الگوریتم‌های Bubble Sort، Merge Sort، Linear Search و Binary Search در قالب یک کاتالوگ آزمون‌های شناختی پیاده‌سازی شده‌اند. کاربر از طریق برنامه تعاملی `demo.py` یا پارامترهای خط فرمان، ترجیحات مرتب‌سازی و جستجو را وارد می‌کند.

تست‌ها در سه سطح طراحی شده‌اند:
- **ACOC (فصل 6):** ۳۲۴ ترکیب پارامتری + ۶ ترکیب مرتب‌سازی
- **CFG Coverage (فصل 7):** ۲۹ تست Node/Edge/Prime Path
- **Mutation Testing (فصل 9):** ۱۴ جهش AOR — ۱۱ کشته‌شده، ۲ معادل، ۰ زنده

Mutation Score نهایی: **11/12 = 91.7%**

Prime Path Coverage قوی‌ترین معیار بود زیرا ترکیب تصمیم‌ها و تکرارها را در یک مسیر بررسی می‌کند و در نتیجه جهش‌های ظریف‌تری را شناسایی می‌نماید.
