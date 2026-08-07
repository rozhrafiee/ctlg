# توضیح کامل پروژه — از صفر تا صد

این فایل همه چیز را به زبان ساده توضیح می‌دهد: برنامه چیست، تست‌ها چطور کار می‌کنند، و هر خط کد چه معنایی دارد.

---

## ۱. برنامه چه کار می‌کند؟

یک **کاتالوگ آزمون شناختی** داریم که شامل آزمون‌هایی مثل «آزمون حافظه»، «آزمون منطق» و... است.

کاربر می‌تواند بگوید:
- «با چه الگوریتمی مرتب کنم؟» → Bubble Sort یا Merge Sort
- «با چه الگوریتمی جستجو کنم؟» → Linear Search یا Binary Search
- «بر اساس چه فیلدی مرتب کنم؟» → title، min_level یا time_limit_minutes
- «دنبال چه چیزی بگردم؟» → مثلاً «حافظه»

تابع اصلی برنامه `process_catalog` است که در فایل `coglearning/algorithms/catalog.py` قرار دارد.

### نمونه داده‌ها

```python
[
    {"title": "آزمون حافظه",  "min_level": 10, "time_limit_minutes": 30},
    {"title": "آزمون تمرکز",  "min_level": 5,  "time_limit_minutes": 20},
    {"title": "آزمون منطق",   "min_level": 15, "time_limit_minutes": 45},
    {"title": "تعیین سطح",    "min_level": 1,  "time_limit_minutes": 60},
]
```

### نمونه خروجی

```python
result = process_catalog(items, query="آزمون", sort_algo="merge", sort_field="min_level")
# خروجی:
{
    "items": [آزمون تمرکز، آزمون حافظه، آزمون منطق],  # مرتب بر اساس min_level
    "meta": {
        "sort_algorithm": "merge",
        "search_algorithm": "linear",
        "total_before": 4,
        "total_after": 3,   # «تعیین سطح» حذف شد چون «آزمون» نداشت
    }
}
```

### اجرای برنامه تعاملی

```powershell
cd coglearning
python -m algorithms.demo                          # حالت تعاملی
python -m algorithms.demo -s merge -f min_level    # حالت CLI
python -m algorithms.demo --list                   # نمایش همه آزمون‌ها
```

---

## ۲. الگوریتم‌های پیاده‌سازی شده

### ۲.۱. Bubble Sort (مرتب‌سازی حبابی)

**ایده:** دو عنصر مجاور را مقایسه می‌کند؛ اگر ترتیب اشتباه است آن‌ها را جابجا می‌کند. این کار را آنقدر تکرار می‌کند تا هیچ جابجایی‌ای نباشد.

```python
def bubble_sort(items, key="title", reverse=False):
    arr = list(items)        # کپی می‌گیرد تا ورودی اصلی تغییر نکند
    n = len(arr)
    if n <= 1:               # اگر خالی یا یک عضو → همان را برمی‌گرداند
        return arr

    for i in range(n):                         # پاس بیرونی
        swapped = False
        for j in range(0, n - i - 1):         # پاس داخلی — هر بار یکی کمتر
            val_a = get_item_value(arr[j], key)
            val_b = get_item_value(arr[j + 1], key)
            if _should_swap(val_a, val_b, reverse):
                arr[j], arr[j + 1] = arr[j + 1], arr[j]   # جابجایی
                swapped = True
        if not swapped:      # اگر در این پاس هیچ جابجایی نشد → مرتب است → زودخروج
            break
    return arr
```

**مثال گام به گام** با `[c, a, b]`:
- پاس ۱: c>a → [a,c,b] → c>b → [a,b,c] → swapped=True
- پاس ۲: a<b و b<c → swapped=False → break → تمام!
- نتیجه: `[a, b, c]`

---

### ۲.۲. Merge Sort (مرتب‌سازی ادغامی)

**ایده:** لیست را به دو نیم تقسیم می‌کند، هر نیم را جداگانه مرتب می‌کند (به صورت بازگشتی)، سپس دو نیم مرتب را با هم ادغام می‌کند.

```python
def merge_sort(items, key="title", reverse=False):
    arr = list(items)
    n = len(arr)
    if n <= 1:          # پایه بازگشت
        return arr

    mid = n // 2
    left  = merge_sort(arr[:mid], key=key, reverse=reverse)   # نیم چپ
    right = merge_sort(arr[mid:], key=key, reverse=reverse)   # نیم راست
    return _merge(left, right, key, reverse)                  # ادغام
```

**مثال با `[m, a, z]`:**
- mid=1 → چپ=[m] راست=[a,z]
- merge_sort([m]) = [m]
- merge_sort([a,z]) → mid=1 → [a] و [z] → _merge → [a,z]
- _merge([m], [a,z]) → a<m → [a], m<z → [a,m], باقیمانده [z] → [a,m,z] ✓

---

### ۲.۳. Linear Search (جستجوی خطی)

**ایده:** یک به یک همه عناصر را بررسی می‌کند. اگر عبارت جستجو در عنوان یا توضیح پیدا شد، اندیس آن را برمی‌گرداند.

```python
def linear_search(items, query, fields=("title", "description")):
    if not query:                      # query خالی → همه اندیس‌ها را برگردان
        return list(range(len(items)))

    query_lower = str(query).lower()
    matches = []
    for i in range(len(items)):        # روی همه آیتم‌ها
        for field in fields:           # در هر فیلد جستجو کن
            value = str(get_item_value(items[i], field)).lower()
            if query_lower in value:   # تطابق جزئی (contains)
                matches.append(i)
                break                  # پیدا شد → به آیتم بعدی برو
    return matches
```

**مثال:** جستجوی «حافظه» در `[آزمون حافظه, آزمون تمرکز]` → `[0]`

---

### ۲.۴. Binary Search (جستجوی دودویی)

**ایده:** فقط روی لیست **مرتب شده** کار می‌کند. همیشه وسط لیست را بررسی می‌کند. اگر مقدار هدف کوچکتر است → نیمه چپ، اگر بزرگتر است → نیمه راست.

```python
def binary_search(items, query, key="title"):
    if not query or len(items) == 0:
        return -1

    left = 0
    right = len(items) - 1

    while left <= right:
        mid = (left + right) // 2           # وسط
        mid_val = get_item_value(items[mid], key)

        if mid_val == query:
            return mid                       # پیدا شد!
        if mid_val < query:
            left = mid + 1                   # برو نیمه راست
        else:
            right = mid - 1                  # برو نیمه چپ

    return -1                                # پیدا نشد
```

**مثال:** در `[a, b, c, d, e]` دنبال `d`:
- mid=2 → arr[2]='c' < 'd' → left=3
- mid=4 → arr[4]='e' > 'd' → right=3
- mid=3 → arr[3]='d' == 'd' → return 3 ✓

**تفاوت مهم با Linear Search:** Binary Search فقط تطابق **دقیق و کامل** پیدا می‌کند. «حافظه» را پیدا نمی‌کند، اما «آزمون حافظه» (عین مقدار فیلد) را پیدا می‌کند.

---

## ۳. تست ۱ — ACOC (فصل ۶ کتاب)

### ACOC چیست؟

ACOC = **All Combinations Coverage** یعنی همه ترکیب‌های ممکن پارامترهای ورودی را تست کن.

### چرا لازم است؟

تابع `process_catalog` پنج پارامتر مستقل دارد. هر کدام چند مقدار ممکن دارند. ممکن است ترکیب خاصی از پارامترها باعث خطا شود که با تست‌های تکی پیدا نمی‌شود.

### پارامترها و مقادیرشان

| پارامتر | مقادیر ممکن | تعداد |
|---|---|---|
| `sort_algo` | `bubble`, `merge` | 2 |
| `search_algo` | `linear`, `binary` | 2 |
| `sort_field` | `title`, `min_level`, `time_limit_minutes` | 3 |
| `query` | خالی `""`, موجود `"آزمون"`, ناموجود `"xyz"` | 3 |
| `size` | خالی `[]`, یک عضو, چند عضو | 3 |
| `order` | `sorted`, `reverse`, `random` | 3 |

**کل ترکیب‌ها: 2 × 2 × 3 × 3 × 3 × 3 = 324 تست**

### کد تست ACOC

```python
# ابتدا مقادیر ممکن هر پارامتر را تعریف می‌کنیم
SIZE_VALUES        = [[], [{"title":"a","min_level":1}], [{"title":"b",...},{"title":"a",...}]]
ORDER_VALUES       = ["sorted", "reverse", "random"]
SORT_FIELD_VALUES  = ["title", "min_level", "time_limit_minutes"]
SORT_ALGO_VALUES   = ["bubble", "merge"]
QUERY_VALUES       = ["", "آزمون", "ناموجود"]
SEARCH_ALGO_VALUES = ["linear", "binary"]

# @pytest.mark.parametrize به pytest می‌گوید این تابع را برای هر ترکیب اجرا کن
@pytest.mark.parametrize("size", SIZE_VALUES)
@pytest.mark.parametrize("order", ORDER_VALUES)
@pytest.mark.parametrize("sort_field", SORT_FIELD_VALUES)
@pytest.mark.parametrize("sort_algo", SORT_ALGO_VALUES)
@pytest.mark.parametrize("query", QUERY_VALUES)
@pytest.mark.parametrize("search_algo", SEARCH_ALGO_VALUES)
def test_acoc_catalog_combinations(size, order, sort_field, sort_algo, query, search_algo):
    result = process_catalog(items, ...)

    # بررسی می‌کنیم خروجی همیشه منطقی است:
    assert "items" in result                                     # کلید items وجود دارد
    assert "meta" in result                                      # کلید meta وجود دارد
    assert result["meta"]["total_after"] == len(result["items"]) # تعداد گزارش‌شده = واقعی
    assert result["meta"]["total_after"] <= result["meta"]["total_before"]  # فیلتر، نه اضافه
    assert result["meta"]["total_before"] == len(items)          # تعداد اولیه دقیق است
```

**یک تابع می‌نویسیم، pytest 324 بار اجرا می‌کند** — هر بار با یک ترکیب متفاوت.

---

## ۴. تست ۲ — CFG Coverage (فصل ۷ کتاب)

### گراف جریان کنترل (CFG) چیست؟

برای هر تابع یک نقشه می‌کشیم که نشان می‌دهد اجرا از کجا شروع می‌شود، به کجا می‌رود، و چه تصمیم‌هایی وجود دارد.

هر «گره» یک بلوک کد است. هر «یال» یک مسیر بین دو گره است. هر `if` یک گره تقسیم می‌سازد که دو یال دارد (True و False).

### گراف Bubble Sort

```
[BS1] شروع: arr=list(items), n=len(arr)
      ↓
[BS2] آیا n ≤ 1 ؟
    ↙ بله (T)           ↘ خیر (F)
[BS3] return arr      [BS4] swapped = False
                            ↓
                      [BS5] آیا j < n-i-1 ؟   ←──────────────────────┐
                          ↙ بله (T)    ↘ خیر (F)                      │
                    [BS6] مقایسه دو   [BS9] آیا not swapped ؟          │
                         آیتم مجاور       ↙ بله (T)   ↘ خیر (F)       │
                    [BS7] آیا باید          ↓              │           │
                          swap کرد؟  [BS11]return      [BS10]i++──────→BS4
                        ↙ بله  ↘ خیر      arr
                    [BS8]swap   │
                    swapped=True│
                         ↓      │
                    [j++]←──────┘
                         └──────────────────────────────────────────────┘
```

### گراف Linear Search

```
[LS1] شروع
      ↓
[LS2] آیا query خالی است؟
    ↙ بله                 ↘ خیر
[LS3] return همه          [LS4] i=0, matches=[]
      اندیس‌ها                  ↓
                          [LS5] آیا i < len(items)؟   ←──────────────┐
                              ↙ بله       ↘ خیر                       │
                          [LS6] بررسی   [LS10] return matches          │
                          فیلدهای item                                 │
                               ↓                                       │
                          [LS7] آیا query در فیلد است؟                 │
                              ↙ بله       ↘ خیر                        │
                          [LS8] اضافه    [LS9] فیلد بعدی              │
                          به matches                                   │
                          break                                        │
                               └──────────────────────────────────────┘
```

### گراف Binary Search

```
[BN1] شروع
      ↓
[BN2] آیا query خالی یا items خالی؟
    ↙ بله             ↘ خیر
[BN3] return -1     [BN4] left=0, right=n-1
                          ↓
                    [BN5] آیا left ≤ right؟   ←──────────────────────┐
                        ↙ بله     ↘ خیر                               │
                    [BN6]       [BN10] return -1                       │
                    mid=(l+r)//2                                       │
                    mid_val=...                                        │
                    [BN7] آیا mid_val == query؟                        │
                        ↙ بله     ↘ خیر                               │
                    [BN8]      [BN9] آیا mid_val < query؟             │
                    return mid      ↙ بله        ↘ خیر               │
                               [BN11]          [BN12]                 │
                               left=mid+1    right=mid-1             │
                                    └──────────────────────────────────┘
```

---

### سه سطح پوشش

#### سطح ۱ — Node Coverage (پوشش گره)

**تعریف:** هر گره در CFG حداقل یک بار اجرا شود.

**هدف:** مطمئن شویم هر بخشی از کد حداقل یک بار اجرا می‌شود.

```python
class TestNodeCoverage:

    # گره BS1 → BS2 → BS3 (مسیر لیست خالی)
    def test_bubble_empty_list(self):
        assert bubble_sort([]) == []

    # گره BS1 → BS2 → BS4 → BS5 → BS6 → BS7 → BS8 (مسیر با swap)
    def test_bubble_reverse_sorted(self):
        items = [{"title": "c"}, {"title": "b"}, {"title": "a"}]
        assert bubble_sort(items, key="title")[0]["title"] == "a"

    # گره BN2 → BN3 (query خالی)
    def test_binary_empty_query(self, sample_items):
        assert binary_search(sample_items, "") == -1

    # گره BN5 → BN6 → BN7 → BN8 (پیدا شد)
    def test_binary_found(self):
        items = [{"title": "a"}, {"title": "b"}, {"title": "c"}]
        assert binary_search(items, "b", key="title") == 1
```

#### سطح ۲ — Edge Coverage (پوشش یال)

**تعریف:** هر یال (هر شاخه تصمیم) حداقل یک بار طی شود. یعنی هر `if` هم با True و هم با False تست شود.

**هدف:** مطمئن شویم نه تنها هر گره، بلکه هر **مسیر بین گره‌ها** نیز اجرا شده.

```python
class TestEdgeCoverage:

    # یال BS7 → True (شاخه swap=بله)
    def test_bubble_swap_branch_taken(self):
        items = [{"title": "b"}, {"title": "a"}]   # نامرتب → swap اتفاق می‌افتد
        result = bubble_sort(items, key="title")
        assert result[0]["title"] == "a"

    # یال BS7 → False (شاخه swap=خیر)
    def test_bubble_swap_branch_not_taken(self):
        items = [{"title": "a"}, {"title": "b"}]   # مرتب → بدون swap
        assert bubble_sort(items, key="title") == items

    # یال BS9 → True (خروج زودهنگام)
    def test_bubble_early_exit_no_swaps(self):
        items = [{"title": "a"}, {"title": "b"}, {"title": "c"}]
        result = bubble_sort(items, key="title")
        assert result == items   # swapped=False → break

    # یال BN9 → True (برو سمت راست در binary search)
    def test_binary_right_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "e"}]
        assert binary_search(items, "e", key="title") == 2

    # یال BN9 → False (برو سمت چپ در binary search)
    def test_binary_left_branch(self):
        items = [{"title": "a"}, {"title": "c"}, {"title": "e"}]
        assert binary_search(items, "a", key="title") == 0
```

#### سطح ۳ — Prime Path Coverage (پوشش مسیر اصلی)

**تعریف:** یک «مسیر اصلی» مسیری است که:
1. ساده است (هیچ گره‌ای تکرار نمی‌شود — به جز حلقه‌ها که یک بار برگشت دارند)
2. قابل گسترش نیست (داخل یک مسیر بزرگتر دیگر نیست)

**هدف:** ترکیب‌های عمیق‌تر را تست کن؛ نه فقط «هر شاخه به تنهایی» بلکه «هر توالی مهم از شاخه‌ها».

```python
class TestPrimePathCoverage:

    # مسیر اصلی: BS4→BS5(T)→BS6→BS7(T)→BS8→BS5(T)→...→BS9(T)→BS11
    # یعنی: چند swap اتفاق می‌افتد، سپس یک پاس بدون swap → خروج
    def test_bubble_full_outer_inner_loop(self):
        items = [{"title": "d"}, {"title": "c"}, {"title": "b"}, {"title": "a"}]
        result = bubble_sort(items, key="title")
        assert [x["title"] for x in result] == ["a", "b", "c", "d"]

    # مسیر اصلی: BN5(T)→BN6→BN9(T)→BN5(T)→BN6→BN7(T)→BN8
    # یعنی: چند تکرار حلقه قبل از پیدا شدن
    def test_binary_search_loop_multiple_iterations(self):
        items = [{"title": chr(c)} for c in range(ord("a"), ord("z") + 1)]  # a تا z
        idx = binary_search(items, "m", key="title")
        assert idx == 12   # m در اندیس 12 است

    # مسیر کامل pipeline: جستجو با linear → مرتب‌سازی با merge → بررسی ترتیب نزولی
    def test_catalog_full_pipeline_search_then_sort(self, sample_items):
        result = process_catalog(
            sample_items,
            query="آزمون",       # جستجو می‌کند
            sort_algo="merge",   # مرتب می‌کند
            sort_field="min_level",
            reverse=True,        # نزولی
        )
        items = result["items"]
        # بررسی می‌کنیم واقعاً نزولی مرتب شده
        for i in range(len(items) - 1):
            assert items[i]["min_level"] >= items[i+1]["min_level"]
```

**چرا Prime Path قوی‌تر است؟**

- Node Coverage: «آیا هر بخش کد اجرا شده؟» → می‌داند آیا کد اجرا شده، نمی‌داند آیا درست کار کرده
- Edge Coverage: «آیا هر شاخه هر دو طرف تست شده؟» → بهتر، اما ترکیب شاخه‌ها را نمی‌بیند
- Prime Path: «آیا ترکیب‌های عمیق اجرا شده؟» → اگر swap اول اتفاق افتد و swap دوم نیفتد، آیا هنوز درست است؟

---

## ۵. تست ۳ — Mutation Testing (فصل ۹ کتاب)

### مفهوم کلی

فرض کن یک برنامه‌نویس اشتباه تایپی کرده. مثلاً `n - i - 1` را `n + i - 1` نوشته. آیا تست‌هایت این اشتباه را می‌فهمند؟

Mutation Testing یعنی:
1. عمداً یک تغییر کوچک در کد می‌دهی (= Mutant می‌سازی)
2. تست‌ها را روی این کد خراب اجرا می‌کنی
3. اگر تستی شکست خورد → mutant **کشته شد** ✅ (تست خوب است)
4. اگر همه تست‌ها پاس شدند → mutant **زنده ماند** ❌ (تست ضعیف است)

ما در این پروژه فقط **عملگرهای حسابی** را تغییر دادیم: `+`, `-`, `*`, `//`

این روش را AOR می‌گویند: **Arithmetic Operator Replacement**.

---

### ۵.۱. ساختار فایل‌های Mutant

هر mutant یک تابع جداگانه است که کپی دقیق تابع اصلی است با **یک تغییر**:

```
coglearning/algorithms/mutants/
├── sorting_mutants.py      ← جهش‌های bubble_sort و merge_sort
├── searching_mutants.py    ← جهش‌های binary_search
└── catalog_mutants.py      ← جهش‌های process_catalog
```

توابع کمکی (`_should_swap`, `_merge`) از ماژول اصلی import می‌شوند — تکرار نمی‌شوند.

---

### ۵.۲. جهش‌های bubble_sort

```python
# کد اصلی — محدوده حلقه داخلی
for j in range(0, n - i - 1):
```

**M-AOR-BS-01:** اولین منها را به جمع تبدیل کن
```python
for j in range(0, n + i - 1):   # ← خراب!
# اثر: برای i=1 و n=3: range(0,3) → j=2 → arr[3] → IndexError
# وضعیت: KILLED ✅
```

**M-AOR-BS-02:** آخرین منها را به جمع تبدیل کن
```python
for j in range(0, n - i + 1):   # ← خراب!
# اثر: در اولین پاس: range(0,n+1) → arr[n] → IndexError
# وضعیت: KILLED ✅
```

**M-AOR-BS-03:** عدد ثابت را از 1 به 2 تبدیل کن
```python
for j in range(0, n - i - 2):   # ← خراب!
# اثر: یک مقایسه کمتر در هر پاس → آخرین جفت هرگز مقایسه نمی‌شود
# مثال [d,c,b,a] → نتیجه [b,c,d,a] نه [a,b,c,d]
# وضعیت: KILLED ✅
```

**M-AOR-BS-04:** منها را به ضربدر تبدیل کن
```python
for j in range(0, n * i - 1):   # ← خراب!
# اثر: i=0 → range(0,-1) = [] → حلقه داخلی خالی → swapped=False → break فوری
# نتیجه: لیست بدون هیچ تغییری برمی‌گردد!
# وضعیت: KILLED ✅
```

---

### ۵.۳. جهش‌های merge_sort

```python
# کد اصلی
mid = n // 2
```

**M-AOR-MS-01:** تقسیم بر ۲ را به تقسیم بر ۱ تبدیل کن
```python
mid = n // 1   # ← n // 1 = n
# اثر: mid=n → arr[:n]=arr (کل لیست) → merge_sort(arr) → همان تابع با همان ورودی → بی‌نهایت!
# وضعیت: KILLED ✅ (RecursionError)
```

**M-AOR-MS-02:** تقسیم بر ۲ را به تقسیم بر ۳ تبدیل کن
```python
mid = n // 3
# اثر: برای n=2 → mid=0 → arr[0:]=arr → بازگشت بی‌نهایت
# وضعیت: KILLED ✅ (RecursionError)
```

**M-AOR-MS-03:** تقسیم کفی را به تقسیم سقفی تبدیل کن
```python
mid = (n + 1) // 2
# اثر: تقسیم کمی نامتعادل‌تر اما هر دو طرف غیرخالی → نتیجه همان است!
# مثال n=5: اصلی mid=2، جهش mid=3 → هر دو درست مرتب می‌کنند
# وضعیت: EQUIVALENT ⚖️ — نمی‌توان کشت چون اشتباه نیست
```

---

### ۵.۴. جهش‌های binary_search

```python
# کد اصلی
mid = (left + right) // 2
```

**M-AOR-BN-01:** جمع را به منها تبدیل کن
```python
mid = (left - right) // 2
# اثر: left=0, right=4 → mid=-2 → arr[-2]="d" در پایتون (اندیس معکوس) → خروجی اشتباه
# وضعیت: KILLED ✅
```

**M-AOR-BN-02:** تقسیم عدد صحیح را به ضربدر تبدیل کن
```python
mid = (left + right) * 2
# اثر: left=0, right=4 → mid=8 → arr[8] برای لیست 5 عضوی → IndexError
# وضعیت: KILLED ✅
```

**M-AOR-BN-03:** تقسیم کفی را به تقسیم سقفی تبدیل کن
```python
mid = (left + right + 1) // 2
# اثر: هر دو روش معتبر binary search هستند — نتیجه همیشه یکسان
# وضعیت: EQUIVALENT ⚖️
```

```python
# کد اصلی — حرکت به راست
left = mid + 1
```

**M-AOR-BN-04:** جمع را به منها تبدیل کن
```python
left = mid - 1
# اثر: وقتی باید به راست برویم، به چپ می‌رویم
# مثال: دنبال 'e' در [a,b,c,d,e] → mid=2='c' → 'e'>'c' → باید left=3، جهش left=1
# نتیجه: حالت پایدار → حلقه بی‌نهایت!
# وضعیت: KILLED ✅ (non-termination — با threading تشخیص داده می‌شود)
```

```python
# کد اصلی — حرکت به چپ
right = mid - 1
```

**M-AOR-BN-05:** منها را به جمع تبدیل کن
```python
right = mid + 1
# اثر: وقتی باید به چپ برویم، به راست می‌رویم → حلقه بی‌نهایت
# وضعیت: KILLED ✅ (non-termination)
```

---

### ۵.۵. جهش‌های catalog

```python
# کد اصلی
"total_before": len(items)
"total_after":  len(sorted_items)
```

**M-AOR-PC-01:** یک واحد به total_before اضافه کن
```python
"total_before": len(items) + 1   # ← گزارش اشتباه
```

**این جهش LIVE بود!** چرا؟ تست قدیمی این را بررسی می‌کرد:
```python
assert total_after <= total_before   # ← اگر total_before یک واحد بزرگتر باشد، هنوز درست است!
```

پس جهش از تست رد می‌شد بدون اینکه کشته شود — **Mutation زنده (Live Mutation)**.

برای کشتنش یک خط اضافه کردیم:
```python
assert result["meta"]["total_before"] == len(items)   # ← حالا جهش کشته می‌شود ✅
```

**M-AOR-PC-02:** یک واحد از total_after کم کن
```python
"total_after": len(sorted_items) - 1
```

این جهش از همان ابتدا کشته می‌شود چون:
```python
assert result["meta"]["total_after"] == len(result["items"])
# len(sorted_items)-1 ≠ len(result["items"])=len(sorted_items) → شکست می‌خورد ✅
```

---

### ۵.۶. Mutation زنده (Live Mutation) چیست؟

Mutation زنده یعنی جهشی که کد را خراب می‌کند اما **هیچ تستی آن را نمی‌فهمد**.

این نشان می‌دهد تست‌ها ضعیف هستند — یک باگ واقعی ممکن است از آن‌ها رد شود.

**مثال واقعی از پروژه ما:**

```python
# کد خراب (M-AOR-PC-01):
"total_before": len(items) + 1    # مثلاً 5 به جای 4

# تست قدیمی:
assert total_after <= total_before  # 4 ≤ 5 → True! جهش کشته نشد ❌

# تست جدید:
assert total_before == len(items)   # 5 ≠ 4 → False! جهش کشته شد ✅
```

---

### ۵.۷. Mutation معادل (Equivalent Mutation) چیست؟

Mutation معادل یعنی جهشی که ظاهراً کد را تغییر می‌دهد اما **در هیچ شرایطی رفتار متفاوتی تولید نمی‌کند**.

این جهش‌ها **نمی‌توان کشت** چون اشتباه نیستند.

**مثال واقعی از پروژه ما (M-AOR-MS-03):**

```python
# اصلی:       mid = n // 2           (تقسیم کفی)
# جهش (معادل): mid = (n+1) // 2      (تقسیم سقفی)
```

در Merge Sort مهم نیست که mid کجاست، فقط نباید صفر یا n باشد. تقسیم کفی و سقفی هر دو نتیجه مرتب یکسانی می‌دهند. برای **هر ورودی ممکن** نتیجه یکسان است → Equivalent.

---

## ۶. محاسبه Mutation Score

```
Mutation Score = (کشته‌شده) / (کل - معادل) × 100
```

| | مقدار |
|---|---|
| کل جهش‌ها | 14 |
| معادل | 2 (M-AOR-MS-03, M-AOR-BN-03) |
| غیرمعادل | 12 |
| کشته‌شده (قبل از اصلاح) | 10 |
| کشته‌شده (بعد از اضافه کردن assert جدید) | 11 |

```
Mutation Score نهایی = 11/12 × 100 = 91.7%
```

---

## ۷. پاسخ سوالات تحلیلی

### کدام معیار پوشش بهتر بود؟

**Prime Path Coverage** قوی‌ترین بود، به این دلیل:

- **Node Coverage** فقط می‌گوید «کد اجرا شد» — نمی‌گوید «درست کار کرد»
- **Edge Coverage** هر شاخه را تست می‌کند — اما توالی شاخه‌ها را نه
- **Prime Path Coverage** ترکیب و توالی شاخه‌ها را تست می‌کند — مثلاً «swap در پاس دوم هم درست است»

نتیجه: Node Coverage هیچ mutantی را به تنهایی نکشت. Edge Coverage M-AOR-BS-01/02 را با IndexError کشت. Prime Path با تست `test_bubble_full_outer_inner_loop` حتی M-AOR-BS-03 (که فقط یک مقایسه کمتر می‌کرد) را هم کشت.

### کدام تست‌ها شکست خوردند؟

در کد **اصلی** هیچ تستی شکست نمی‌خورد — همه 376 تست پاس می‌شوند.

وقتی **جهش‌ها** اعمال می‌شوند:

| جهش | تست‌هایی که آن را می‌کشند |
|---|---|
| M-AOR-BS-01/02 | هر تستی با لیست ≥2 عضو → IndexError |
| M-AOR-BS-03 | `test_bubble_full_outer_inner_loop`, `test_acoc_sort_produces_ordered_output` |
| M-AOR-BS-04 | `test_bubble_swap_branch_taken`, `test_acoc_sort_produces_ordered_output` |
| M-AOR-MS-01/02 | هر تستی با merge_sort و لیست ≥2 عضو → RecursionError |
| M-AOR-BN-01/02 | `test_binary_mid_branch`, `test_binary_left_branch`, `test_binary_right_branch` |
| M-AOR-BN-04/05 | `test_binary_right_branch`, `test_binary_search_loop_multiple_iterations` |
| M-AOR-PC-01 | `test_acoc_catalog_combinations` (بعد از اضافه کردن assert جدید) |
| M-AOR-PC-02 | `test_acoc_catalog_combinations` (assert قدیمی) |

### چطور Mutation Score را بهبود دادیم؟

فقط یک خط اضافه کردیم که M-AOR-PC-01 را کشت:

```python
assert result["meta"]["total_before"] == len(items)
```

**Score از 83.3% به 91.7% رفت.**

برای رسیدن به 100% در پروژه‌های مشابه می‌توان:
- روی مقادیر دقیق متادیتا assert اضافه کرد
- لیست‌های بزرگ‌تر در تست binary search استفاده کرد
- حالت‌های مرزی مثل لیست با عناصر تکراری را تست کرد

---

## ۸. اجرای کامل پروژه

```powershell
cd C:\Users\amazonshop\Desktop\ctlg\coglearning

# برنامه تعاملی
python -m algorithms.demo

# همه تست‌ها
python -m pytest

# فقط ACOC
python -m pytest algorithms/tests/test_coverage.py -k "acoc" -v

# فقط CFG (Node/Edge/Prime Path)
python -m pytest algorithms/tests/test_coverage.py -k "not acoc" -v

# فقط Mutation Killing
python -m pytest algorithms/tests/test_mutation_killing.py -v

# گزارش پوشش کد
python -m pytest --cov=algorithms --cov-report=term-missing
```

**نتیجه: 376 passed** — همه تست‌ها پاس می‌شوند.

---

## ۹. ساختار فایل‌های پروژه

```
coglearning/algorithms/
├── sorting.py               ← bubble_sort, merge_sort
├── searching.py             ← linear_search, binary_search
├── catalog.py               ← process_catalog (تابع اصلی)
├── utils.py                 ← get_item_value (ابزار کمکی)
├── demo.py                  ← برنامه CLI تعاملی
│
├── mutants/                 ← جهش‌های AOR (فصل ۹)
│   ├── __init__.py          ← توضیح همه ۱۴ جهش و وضعیتشان
│   ├── sorting_mutants.py   ← M-AOR-BS-01~04 و M-AOR-MS-01~03
│   ├── searching_mutants.py ← M-AOR-BN-01~05
│   └── catalog_mutants.py  ← M-AOR-PC-01~02
│
└── tests/
    ├── test_coverage.py         ← ACOC (324 تست) + Node/Edge/Prime Path (29 تست)
    └── test_mutation_killing.py ← کشتن ۱۴ جهش (17 تست)
```
