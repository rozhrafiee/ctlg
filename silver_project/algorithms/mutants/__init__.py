"""
پکیج mutants — جهش‌های عملگر حسابی (AOR) برای فصل نهم آزمون نرم‌افزار

هر تابع در این پکیج فقط همان تابعی را که جهش دارد دوباره می‌نویسد.
تمام توابع کمکی (مثل _should_swap، _merge، get_item_value) از ماژول‌های
اصلی (algorithms.sorting، algorithms.utils) import می‌شوند و تکرار نمی‌شوند.
دلیل اینکه خود تابع جهش‌دار باید کپی شود: Python نمی‌تواند یک عملگر حسابی
را در runtime تغییر دهد؛ ابزارهایی مثل mutmut هم همین کار را انجام می‌دهند
ولی مستقیم سورس فایل را موقتاً تغییر می‌دهند.

وضعیت جهش‌ها:
──────────────────────────────────────────────────────────
  M-AOR-BS-01  bubble_sort   n-i-1 → n+i-1    KILLED  (IndexError)
  M-AOR-BS-02  bubble_sort   n-i-1 → n-i+1    KILLED  (IndexError)
  M-AOR-BS-03  bubble_sort   n-i-1 → n-i-2    KILLED  (خروجی اشتباه)
  M-AOR-BS-04  bubble_sort   n-i-1 → n*i-1    KILLED  (خروجی اشتباه)
  M-AOR-MS-01  merge_sort    n//2  → n//1      KILLED  (RecursionError)
  M-AOR-MS-02  merge_sort    n//2  → n//3      KILLED  (RecursionError)
  M-AOR-MS-03  merge_sort    n//2  → (n+1)//2  EQUIVALENT (همان خروجی)
  M-AOR-BN-01  binary_search (l+r)//2→(l-r)//2 KILLED (خروجی اشتباه)
  M-AOR-BN-02  binary_search (l+r)//2→(l+r)*2  KILLED  (IndexError)
  M-AOR-BN-03  binary_search (l+r)//2→(l+r+1)//2 EQUIVALENT
  M-AOR-BN-04  binary_search left=mid+1→mid-1  KILLED  (حلقه بی‌نهایت)
  M-AOR-BN-05  binary_search right=mid-1→mid+1 KILLED  (حلقه بی‌نهایت)
  M-AOR-PC-01  catalog       total_before→+1   LIVE    (هیچ تستی total_before بررسی نمی‌کند)
  M-AOR-PC-02  catalog       total_after→-1    KILLED  (test_acoc assert می‌کند)
──────────────────────────────────────────────────────────
Mutation Score = killed / (total - equivalent) = 10 / (14 - 3) = 90.9 %
بعد از اضافه کردن assert صریح total_before : 11 / (14 - 3) = 100 %
"""
