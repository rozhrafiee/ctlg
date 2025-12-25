"""
دستور Django برای ایجاد آزمون تعیین سطح اولیه با سوالات نمونه
"""
from django.core.management.base import BaseCommand
from assessment.models import CognitiveTest, Question, Choice


class Command(BaseCommand):
    help = "ایجاد آزمون تعیین سطح اولیه با سوالات نمونه ارزیابی سواد شناختی"

    def handle(self, *args, **options):
        # حذف آزمون تعیین سطح قبلی (اگر وجود دارد)
        CognitiveTest.objects.filter(is_placement_test=True).delete()

        # ایجاد آزمون تعیین سطح
        placement_test = CognitiveTest.objects.create(
            title="آزمون تعیین سطح سواد شناختی",
            description="این آزمون برای ارزیابی اولیه سطح سواد شناختی شما در مواجهه با اطلاعات و تهدیدات شناختی طراحی شده است. لطفاً به تمام سوالات با دقت پاسخ دهید.",
            min_level=1,
            max_level=10,
            is_active=True,
            is_placement_test=True,
        )

        self.stdout.write(self.style.SUCCESS(f"آزمون تعیین سطح ایجاد شد: {placement_test.id}"))

        # سوال 1
        q1 = Question.objects.create(
            test=placement_test,
            text="یک پست شبکه اجتماعی ادعا می‌کند که یک خط مترو فرو ریخته است. اولین اقدام شما چیست؟",
            question_type="mcq",
            order=1,
        )
        Choice.objects.create(question=q1, text="بازنشر فوری پست", is_correct=False, score=0)
        Choice.objects.create(question=q1, text="بررسی صحت ادعا از طریق کانال‌های رسمی اطلاع‌رسانی شهری", is_correct=True, score=25)
        Choice.objects.create(question=q1, text="اظهار نظر شخصی در بخش نظرات", is_correct=False, score=0)
        Choice.objects.create(question=q1, text="نادیده گرفتن پست", is_correct=False, score=5)

        # سوال 2
        q2 = Question.objects.create(
            test=placement_test,
            text="کدام مورد می‌تواند نشانه‌ای از اطلاعات نادرست باشد؟",
            question_type="mcq",
            order=2,
        )
        Choice.objects.create(question=q2, text="منبع، حساب رسمی دولتی است", is_correct=False, score=0)
        Choice.objects.create(question=q2, text="خبر از چند منبع معتبر تأیید شده است", is_correct=False, score=0)
        Choice.objects.create(question=q2, text="استفاده از ادبیات هیجانی بدون ارجاع قابل راستی‌آزمایی", is_correct=True, score=25)
        Choice.objects.create(question=q2, text="استفاده از تصاویر منتشر شده توسط منابع معتبر", is_correct=False, score=0)

        # سوال 3
        q3 = Question.objects.create(
            test=placement_test,
            text="در شرایط اضطراری، شهروند دو گزارش متناقض درباره مسیرهای فعال اتوبوس دریافت می‌کند. مناسب‌ترین راهبرد چیست؟",
            question_type="mcq",
            order=3,
        )
        Choice.objects.create(question=q3, text="پیروی از گزارشی که بیشترین لایک را دارد", is_correct=False, score=0)
        Choice.objects.create(question=q3, text="بررسی کانال‌های رسمی حمل‌ونقل شهری و اعلان‌های شهرداری", is_correct=True, score=25)
        Choice.objects.create(question=q3, text="پرس‌وجو از همسایه", is_correct=False, score=10)
        Choice.objects.create(question=q3, text="فرض نادرست بودن هر دو گزارش", is_correct=False, score=5)

        # سوال 4
        q4 = Question.objects.create(
            test=placement_test,
            text="تصویری که آسیب به زیرساخت را نشان می‌دهد به‌طور گسترده منتشر شده است. اقدام ضروری برای راستی‌آزمایی چیست؟",
            question_type="mcq",
            order=4,
        )
        Choice.objects.create(question=q4, text="بازنشر تصویر برای هشدار به دیگران", is_correct=False, score=0)
        Choice.objects.create(question=q4, text="بررسی متادیتای تصویر و تطبیق آن با اخبار رسمی یا کانال‌های شهرداری", is_correct=True, score=25)
        Choice.objects.create(question=q4, text="اعتماد به تصویر به‌دلیل واقعی به‌نظر رسیدن", is_correct=False, score=0)
        Choice.objects.create(question=q4, text="حذف تصویر", is_correct=False, score=5)

        self.stdout.write(self.style.SUCCESS(f"✓ {Question.objects.filter(test=placement_test).count()} سوال با گزینه‌ها ایجاد شد"))
        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ آزمون تعیین سطح با موفقیت ایجاد شد!\n"
                f"   ID آزمون: {placement_test.id}\n"
                f"   تعداد سوالات: {Question.objects.filter(test=placement_test).count()}\n"
                f"   حداکثر نمره: {Question.objects.filter(test=placement_test).count() * 25}"
            )
        )

