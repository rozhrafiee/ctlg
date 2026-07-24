"""
Seed 5 sample rows for each application model (demo / local DB fill).

Creates interconnected sample_* users and related content, tests, sessions,
progress, and analytics so the app has usable fixture data.
"""

from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from adaptive_learning.models import (
    ContentRecommendation,
    LearningContent,
    LearningPath,
    LearningPathItem,
    UserContentProgress,
)
from analytics.models import (
    LearningAnalytics,
    LevelHistory,
    UserAbandonmentSample,
    UserPerformanceSummary,
)
from assessment.models import Answer, Choice, CognitiveTest, Question, TestSession

User = get_user_model()

SAMPLE_PREFIX = "sample_"
PASSWORD_DEFAULT = "SamplePass123!"

STUDENT_PROFILES = [
    # username, first, last, level, memory, focus, logic, login_iv, duration, failed, progress, abandoned
    ("sample_student1", "علی", "نوری", 45, 50, 42, 48, 4.0, 180, 2, 0.45, False),
    ("sample_student2", "مریم", "کاظمی", 62, 65, 60, 68, 2.5, 290, 1, 0.62, False),
    ("sample_student3", "حسین", "رضایی", 28, 30, 25, 32, 22.0, 45, 8, 0.28, True),
    ("sample_student4", "زهرا", "احمدی", 78, 80, 75, 82, 1.5, 410, 0, 0.78, False),
    ("sample_student5", "امیر", "محمدی", 55, 52, 58, 54, 6.0, 210, 3, 0.55, False),
]

CONTENT_TITLES = [
    ("مقدمات حافظه کاری", "text", "تمرین کوتاه برای تقویت حافظه کوتاه‌مدت."),
    ("تمرکز پایدار", "video", "https://example.com/video/focus-1"),
    ("منطق و استدلال", "text", "مسائل ساده استدلال منطقی."),
    ("یادآوری تصویری", "video", "https://example.com/video/memory-2"),
    ("حل مسئله گام‌به‌گام", "text", "چارچوب حل مسئله در چند مرحله."),
]

TEST_TITLES = [
    ("آزمون تعیین سطح نمونه", "placement", 1, 20),
    ("آزمون حافظه نمونه", "general", 10, 40),
    ("آزمون تمرکز نمونه", "general", 20, 50),
    ("آزمون منطق نمونه", "general", 30, 60),
    ("آزمون مرتبط با محتوا", "content_based", 1, 30),
]

QUESTION_BANK = [
    ("memory", "کدام گزینه ظرفیت حافظه کوتاه‌مدت را بهتر توصیف می‌کند؟", "۷±۲ آیتم"),
    ("focus", "برای حفظ تمرکز در مطالعه طولانی، کدام روش مناسب‌تر است؟", "تقسیم کار به بازه‌های کوتاه"),
    ("logic", "اگر همه Aها B باشند و همه Bها C باشند، همه Aها چه هستند؟", "C هستند"),
    ("memory", "یادآوری فهرستی از واژه‌ها پس از چند دقیقه مربوط به کدام مهارت است؟", "حافظه کاری"),
    ("logic", "کدام گزینه ادامه الگوی ۲، ۴، ۸، ۱۶ است؟", "۳۲"),
]

EVENT_TYPES = [
    "login",
    "view_content",
    "start_test",
    "finish_test",
    "view_dashboard",
]


class Command(BaseCommand):
    help = "Create 5 sample rows for each model to fill the local database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default=PASSWORD_DEFAULT,
            help="Password for seeded sample_* accounts",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded sample_* users (cascades related rows) first",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        clear = options["clear"]
        now = timezone.now()
        counts: dict[str, int] = {}

        if clear:
            deleted, _ = User.objects.filter(username__startswith=SAMPLE_PREFIX).delete()
            # Orphan synthetic samples tagged by our seed marker in event data / titles
            extra = UserAbandonmentSample.objects.filter(
                is_synthetic=True,
                user__isnull=True,
                avg_login_interval_days__in=[3.0, 5.0, 12.0, 25.0, 35.0],
            ).delete()[0]
            self.stdout.write(
                self.style.WARNING(f"Cleared sample users={deleted}, orphan samples={extra}")
            )

        # --- Users (5 students + 1 teacher author for content) ---
        teacher, _ = User.objects.get_or_create(
            username="sample_teacher",
            defaults={
                "first_name": "سارا",
                "last_name": "معلمی",
                "role": "teacher",
                "email": "sample_teacher@example.com",
            },
        )
        teacher.first_name = "سارا"
        teacher.last_name = "معلمی"
        teacher.role = "teacher"
        teacher.set_password(password)
        teacher.save()

        students: list[User] = []
        for i, profile in enumerate(STUDENT_PROFILES):
            (
                username,
                first,
                last,
                level,
                memory,
                focus,
                logic,
                login_iv,
                duration,
                failed,
                progress,
                abandoned,
            ) = profile
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": "student",
                    "cognitive_level": level,
                    "has_taken_placement_test": True,
                    "email": f"{username}@example.com",
                    "is_active": not abandoned,
                },
            )
            user.set_password(password)
            user.first_name = first
            user.last_name = last
            user.role = "student"
            user.cognitive_level = level
            user.has_taken_placement_test = True
            user.is_active = not abandoned
            user.date_joined = now - timedelta(days=30 - i * 3)
            user.save()
            students.append(user)
        counts["User"] = len(students) + 1  # + teacher

        # --- LearningContent (5) ---
        contents: list[LearningContent] = []
        for i, (title, ctype, payload) in enumerate(CONTENT_TITLES):
            kwargs = {
                "title": title,
                "content_type": ctype,
                "author": teacher,
                "min_level": 1 + i * 5,
                "max_level": 40 + i * 10,
                "is_active": True,
            }
            if ctype == "text":
                kwargs["body"] = payload
            else:
                kwargs["video_url"] = payload
                kwargs["body"] = ""
            content, _ = LearningContent.objects.update_or_create(
                title=title,
                author=teacher,
                defaults=kwargs,
            )
            contents.append(content)
        counts["LearningContent"] = len(contents)

        # --- CognitiveTest (5) ---
        tests: list[CognitiveTest] = []
        for i, (title, test_type, min_lvl, target) in enumerate(TEST_TITLES):
            related = contents[i] if test_type == "content_based" else None
            test, _ = CognitiveTest.objects.update_or_create(
                title=title,
                defaults={
                    "test_type": test_type,
                    "description": f"نمونه داده آزمایشی: {title}",
                    "created_by": teacher,
                    "min_level": min_lvl,
                    "target_level": target,
                    "related_content": related,
                    "time_limit_minutes": 20 + i * 5,
                    "passing_score": 70,
                    "is_active": True,
                },
            )
            tests.append(test)
        counts["CognitiveTest"] = len(tests)

        # --- Question (5) + Choice (5 correct + extras for variety → exactly 5 Choice rows? user asked 5 each)
        # Create 5 questions (one per test) and 5 choices (one correct per question).
        questions: list[Question] = []
        choices: list[Choice] = []
        for i, (category, text, correct) in enumerate(QUESTION_BANK):
            question, _ = Question.objects.update_or_create(
                test=tests[i],
                order=1,
                defaults={
                    "category": category,
                    "question_type": "mcq",
                    "text": text,
                    "points": 10 + i,
                },
            )
            questions.append(question)
            # Keep exactly one choice per question for the "5 Choice" count;
            # still mark it correct so sessions can score.
            choice, _ = Choice.objects.update_or_create(
                question=question,
                order=0,
                defaults={"text": correct, "is_correct": True},
            )
            choices.append(choice)
        counts["Question"] = len(questions)
        counts["Choice"] = len(choices)

        # --- LearningPath (5) + LearningPathItem (5) ---
        paths: list[LearningPath] = []
        path_items: list[LearningPathItem] = []
        for i, student in enumerate(students):
            path, _ = LearningPath.objects.update_or_create(
                user=student,
                name=f"مسیر یادگیری نمونه {i + 1}",
                defaults={"is_active": True},
            )
            paths.append(path)
            item, _ = LearningPathItem.objects.update_or_create(
                path=path,
                content=contents[i],
                defaults={"order": i + 1, "is_unlocked": i < 3},
            )
            path_items.append(item)
        counts["LearningPath"] = len(paths)
        counts["LearningPathItem"] = len(path_items)

        # --- UserContentProgress (5) ---
        progresses: list[UserContentProgress] = []
        for i, student in enumerate(students):
            prog, _ = UserContentProgress.objects.update_or_create(
                user=student,
                content=contents[i],
                defaults={
                    "progress_percent": 20.0 * (i + 1),
                    "is_completed": i >= 3,
                },
            )
            progresses.append(prog)
        counts["UserContentProgress"] = len(progresses)

        # --- ContentRecommendation (5) ---
        recs: list[ContentRecommendation] = []
        for i, student in enumerate(students):
            rec, _ = ContentRecommendation.objects.update_or_create(
                user=student,
                content=contents[(i + 1) % 5],
                recommendation_type="level_match",
                defaults={
                    "priority_weight": 1.0 + i * 0.2,
                    "is_clicked": i % 2 == 0,
                },
            )
            recs.append(rec)
        counts["ContentRecommendation"] = len(recs)

        # --- TestSession (5) + Answer (5) ---
        sessions: list[TestSession] = []
        answers: list[Answer] = []
        for i, student in enumerate(students):
            test = tests[i]
            finished = now - timedelta(hours=i + 1)
            started = finished - timedelta(minutes=15 + i * 3)
            session, _ = TestSession.objects.update_or_create(
                user=student,
                test=test,
                defaults={
                    "status": "completed" if i < 4 else "in_progress",
                    "expires_at": started + timedelta(minutes=test.time_limit_minutes),
                    "finished_at": finished if i < 4 else None,
                    "total_score": 55.0 + i * 8,
                    "teacher_feedback": "بازخورد نمونه" if i < 2 else "",
                    "reviewed_by": teacher if i < 2 else None,
                },
            )
            # update_or_create cannot set started_at (auto_now_add); patch if needed
            TestSession.objects.filter(pk=session.pk).update(started_at=started)
            session.refresh_from_db()
            sessions.append(session)

            answer, _ = Answer.objects.update_or_create(
                session=session,
                question=questions[i],
                defaults={
                    "selected_choice": choices[i],
                    "score_earned": float(questions[i].points),
                    "is_reviewed": i < 2,
                    "time_spent_seconds": 30 + i * 10,
                },
            )
            answers.append(answer)
        counts["TestSession"] = len(sessions)
        counts["Answer"] = len(answers)

        # --- LevelHistory (5) ---
        histories: list[LevelHistory] = []
        for i, student in enumerate(students):
            hist, _ = LevelHistory.objects.update_or_create(
                user=student,
                reason=f"sample_seed_{i + 1}",
                defaults={
                    "old_level": max(1, student.cognitive_level - 5),
                    "new_level": student.cognitive_level or 1,
                    "test_session": sessions[i],
                },
            )
            histories.append(hist)
        counts["LevelHistory"] = len(histories)

        # --- LearningAnalytics (5) ---
        analytics_rows: list[LearningAnalytics] = []
        for i, student in enumerate(students):
            row, _ = LearningAnalytics.objects.update_or_create(
                user=student,
                event_type=EVENT_TYPES[i],
                defaults={
                    "event_data": {"source": "seed_sample_data", "index": i + 1},
                },
            )
            analytics_rows.append(row)
        counts["LearningAnalytics"] = len(analytics_rows)

        # --- UserPerformanceSummary (5) ---
        summaries: list[UserPerformanceSummary] = []
        for i, student in enumerate(students):
            (
                _u,
                _f,
                _l,
                _lvl,
                memory,
                focus,
                logic,
                login_iv,
                duration,
                failed,
                progress,
                abandoned,
            ) = STUDENT_PROFILES[i]
            summary, _ = UserPerformanceSummary.objects.update_or_create(
                user=student,
                defaults={
                    "avg_memory_score": memory,
                    "avg_focus_score": focus,
                    "avg_logic_score": logic,
                    "total_tests_completed": i + 1,
                    "avg_login_interval_days": login_iv,
                    "duration_of_use_minutes": duration,
                    "failed_tests_count": failed,
                    "progress_rate": progress,
                    "abandoned": abandoned,
                },
            )
            summaries.append(summary)
        counts["UserPerformanceSummary"] = len(summaries)

        # --- UserAbandonmentSample (5) ---
        sample_rows = [
            (3.0, 300.0, 1, 0.70, False),
            (5.0, 220.0, 2, 0.55, False),
            (12.0, 90.0, 5, 0.35, False),
            (25.0, 40.0, 9, 0.20, False),
            (35.0, 15.0, 12, 0.10, True),
        ]
        abandonment: list[UserAbandonmentSample] = []
        for i, (login_iv, duration, failed, progress, abandoned) in enumerate(sample_rows):
            row, _ = UserAbandonmentSample.objects.update_or_create(
                user=students[i],
                is_synthetic=True,
                defaults={
                    "avg_login_interval_days": login_iv,
                    "duration_of_use_minutes": duration,
                    "failed_tests_count": failed,
                    "progress_rate": progress,
                    "abandoned": abandoned,
                },
            )
            abandonment.append(row)
        counts["UserAbandonmentSample"] = len(abandonment)

        self.stdout.write(self.style.SUCCESS("Seeded 5 samples per model:"))
        for name, n in counts.items():
            self.stdout.write(f"  {name}: {n}")
        self.stdout.write(
            self.style.SUCCESS(
                f"Login: sample_student1…5 / sample_teacher  password={password}"
            )
        )
