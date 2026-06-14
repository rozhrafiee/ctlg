"""Seed default cognitive placement test for the ctlg platform."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from assessment.models import CognitiveTest, Question, Choice

User = get_user_model()

PLACEMENT = {
    "title": "آزمون تعیین سطح سواد شناختی",
    "description": (
        "این آزمون سطح اولیه شما را در سه حوزه حافظه، تمرکز و منطق (۱ تا ۱۰۰) "
        "بر اساس سناریوهای اطلاعات شهری و تشخیص محتوای گمراه‌کننده تعیین می‌کند."
    ),
    "time_limit_minutes": 45,
    "min_level": 1,
    "target_level": 1,
    "passing_score": 50,
    "questions": [
        {
            "order": 0,
            "category": "memory",
            "text": "خبر زیر را بخوانید: «قطع آب منطقه ۳ از ساعت ۸ تا ۱۲ فردا.» کدام جزء این خبر برای تصمیم‌گیری مهم‌تر است؟",
            "choices": [
                ("شماره منطقه", True),
                ("رنگ لوگوی شرکت آب", False),
                ("نام خبرنگار", False),
                ("تعداد لایک پست", False),
            ],
        },
        {
            "order": 1,
            "category": "memory",
            "text": "در پیام زنجیره‌ای آمده: «این دارو ۱۰۰٪ کرونا را درمان می‌کند — فقط امروز.» بهترین یادداشت ذهنی برای ارزیابی این ادعا چیست؟",
            "choices": [
                ("ادعای قطعی بدون منبع + فوریت زمانی", True),
                ("طول پیام", False),
                ("استفاده از ایموجی", False),
                ("ارسال توسط دوست", False),
            ],
        },
        {
            "order": 2,
            "category": "memory",
            "text": "سه منبع رسمی، دو منبع ناشناس و یک اسکرین‌شات بدون تاریخ دیده‌اید. برای حفظ «تصویر ذهنی» درست از رویداد، اولویت با کدام است؟",
            "choices": [
                ("منابع رسمی با تاریخ و سازمان مشخص", True),
                ("پست با بیشترین بازدید", False),
                ("اولین پیامی که خوانده‌اید", False),
                ("عکس بدون توضیح", False),
            ],
        },
        {
            "order": 3,
            "category": "focus",
            "text": "هنگام خواندن خبر قطعی برق، کدام رفتار تمرکز شناختی را حفظ می‌کند؟",
            "choices": [
                ("بررسی زمان، محدوده و منبع قبل از بازنشر", True),
                ("بازنشر فوری برای هشدار همسایگان", False),
                ("نادیده گرفتن جزئیات و فقط خواندن تیتر", False),
                ("مقایسه با شایعات شبکه‌های اجتماعی", False),
            ],
        },
        {
            "order": 4,
            "category": "focus",
            "text": "در نمایش ویدیوی «حادثه شهری»، چه نشانه‌ای حواس شما را از ارزیابی واقعی منحرف می‌کند؟",
            "choices": [
                ("موسیقی احساسی و کپشن هیجان‌زا بدون مکان/زمان", True),
                ("کیفیت تصویر پایین", False),
                ("زیرنویس فارسی", False),
                ("طول ویدیو", False),
            ],
        },
        {
            "order": 5,
            "category": "focus",
            "text": "برای تمرکز روی «اعتبار منبع»، کدام گام منطقی‌تر است؟",
            "choices": [
                ("تطبیق خبر با سایت رسمی دستگاه مربوطه", True),
                ("شمارش تعداد بازنشرها", False),
                ("انتخاب خبری که با نظر شما هم‌راستاست", False),
                ("تکیه بر نظر یک کاربر ناشناس", False),
            ],
        },
        {
            "order": 6,
            "category": "logic",
            "text": "ادعا: «چون امسال باران کم بود، پس قطعی آب فردا قطعی است.» اشکال منطقی این استدلال چیست؟",
            "choices": [
                ("نتیجه‌گیری قطعی از یک عامل بدون بررسی سایر علل", True),
                ("استفاده از واژه «فردا»", False),
                ("اشاره به باران", False),
                ("طول جمله", False),
            ],
        },
        {
            "order": 7,
            "category": "logic",
            "text": "دو خبر متناقض درباره زمان رفع قطعی برق منتشر شده. بهترین رویکرد منطقی کدام است؟",
            "choices": [
                ("انتظار برای تایید منبع رسمی و مقایسه جزئیات", True),
                ("انتخاب خبری که زودتر منتشر شده", False),
                ("ترکیب هر دو و ساختن زمان جدید", False),
                ("نادیده گرفتن هر دو و حدس زدن", False),
            ],
        },
        {
            "order": 8,
            "category": "logic",
            "text": "پیام: «۹۹٪ شهروندان از این تصمیم شهرداری ناراضی‌اند» بدون ارجاع به نظرسنجی. این ادعا از نظر منطق شناختی چگونه است؟",
            "choices": [
                ("آمار بدون منبع — قابل اتکا نیست", True),
                ("چون عدد بزرگ است، حتماً درست است", False),
                ("اگر در گروه محلی آمده، معتبر است", False),
                ("اگر احساسی باشد، قابل قبول است", False),
            ],
        },
        {
            "order": 9,
            "category": "logic",
            "text": "برای کاهش خطر باور به اطلاعات گمراه‌کننده در بحران شهری، کدام استراتژی منطقی‌تر است؟",
            "choices": [
                ("تأیید چندمنبعی + تأخیر کنترل‌شده قبل از بازنشر", True),
                ("بازنشر سریع برای «احتیاط»", False),
                ("اعتماد به پست‌های ویروسی", False),
                ("نادیده گرفتن همه اخبار", False),
            ],
        },
    ],
}


class Command(BaseCommand):
    help = "Create or update the default cognitive placement test."

    def handle(self, *args, **options):
        admin = User.objects.filter(role="admin").first()
        teacher = User.objects.filter(role="teacher").first()
        creator = admin or teacher

        test, created = CognitiveTest.objects.update_or_create(
            test_type="placement",
            title=PLACEMENT["title"],
            defaults={
                "description": PLACEMENT["description"],
                "time_limit_minutes": PLACEMENT["time_limit_minutes"],
                "min_level": PLACEMENT["min_level"],
                "target_level": PLACEMENT["target_level"],
                "passing_score": PLACEMENT["passing_score"],
                "is_active": True,
                "created_by": creator,
            },
        )

        if not created:
            test.questions.all().delete()

        for q in PLACEMENT["questions"]:
            question = Question.objects.create(
                test=test,
                order=q["order"],
                category=q["category"],
                question_type="mcq",
                text=q["text"],
                points=10,
            )
            for idx, (text, is_correct) in enumerate(q["choices"]):
                Choice.objects.create(
                    question=question,
                    text=text,
                    is_correct=is_correct,
                    order=idx,
                )

        action = "created" if created else "updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"Placement test {action}: id={test.id}, questions={test.questions.count()}"
            )
        )

        # آزمون‌های نمونه برای نمایش مرتب‌سازی در فرانت
        samples = [
            {"title": "آزمون حافظه کوتاه‌مدت", "min_level": 15, "time_limit_minutes": 25, "description": "سنجش حافظه کاری"},
            {"title": "آزمون تمرکز و دقت", "min_level": 8, "time_limit_minutes": 20, "description": "سنجش توجه پایدار"},
            {"title": "آزمون منطق و استدلال", "min_level": 22, "time_limit_minutes": 35, "description": "سنجش تفکر انتقادی"},
            {"title": "آزمون تشخیص اطلاعات", "min_level": 12, "time_limit_minutes": 30, "description": "سواد رسانه‌ای شهری"},
            {"title": "آزمون واکنش شناختی", "min_level": 5, "time_limit_minutes": 15, "description": "سرعت پردازش"},
        ]
        added = 0
        for s in samples:
            _, was_created = CognitiveTest.objects.get_or_create(
                title=s["title"],
                defaults={
                    "test_type": "general",
                    "description": s["description"],
                    "min_level": s["min_level"],
                    "target_level": s["min_level"],
                    "time_limit_minutes": s["time_limit_minutes"],
                    "passing_score": 70,
                    "is_active": True,
                    "created_by": creator,
                },
            )
            if was_created:
                added += 1
        self.stdout.write(self.style.SUCCESS(f"Sample exams: {added} new, {len(samples)} total"))
