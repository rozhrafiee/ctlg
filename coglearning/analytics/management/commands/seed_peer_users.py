"""
Seed peer citizen users who registered around the same time,
with engagement CSV fields + cognitive scores for motivation UI.
"""

from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from analytics.models import UserAbandonmentSample, UserPerformanceSummary

User = get_user_model()

PEER_PROFILES = [
    # username, first, last, level, memory, focus, logic, login_interval, duration, failed, progress, abandoned, day_offset
    ("peer_aria", "آریا", "محمدی", 72, 78, 70, 74, 2.5, 320, 1, 0.72, False, -2),
    ("peer_sara", "سارا", "کریمی", 65, 68, 72, 60, 3.1, 280, 2, 0.65, False, -1),
    ("peer_nima", "نیما", "رضایی", 48, 45, 50, 52, 8.0, 120, 6, 0.48, False, 0),
    ("peer_elsa", "السا", "حسینی", 81, 84, 79, 82, 1.8, 410, 0, 0.81, False, -3),
    ("peer_reza", "رضا", "احمدی", 35, 30, 40, 38, 14.0, 60, 9, 0.35, True, 1),
    ("peer_mina", "مینا", "کاظمی", 58, 55, 62, 57, 4.5, 210, 3, 0.58, False, -1),
    ("peer_omid", "امید", "جعفری", 90, 92, 88, 91, 1.2, 520, 0, 0.90, False, -4),
    ("peer_lida", "لیدا", "مرادی", 42, 48, 40, 44, 11.0, 95, 7, 0.42, False, 2),
    ("peer_kami", "کامیار", "نوری", 55, 52, 58, 54, 5.0, 180, 4, 0.55, False, 0),
    ("peer_hana", "هانا", "صادقی", 68, 70, 66, 71, 2.8, 300, 2, 0.68, False, -2),
    ("peer_pari", "پریسا", "اکبری", 28, 25, 30, 27, 18.0, 40, 12, 0.28, True, 3),
    ("peer_dara", "دارا", "یوسفی", 76, 74, 80, 75, 2.0, 360, 1, 0.76, False, -5),
]


class Command(BaseCommand):
    help = "Seed ≥10 peer students with engagement CSV metrics for the motivation cohort UI"

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default="PeerPass123!",
            help="Password for seeded peer accounts",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete previously seeded peer_* users before inserting",
        )
        parser.add_argument(
            "--anchor-username",
            type=str,
            default="",
            help="Optional existing student username to center the cohort date_joined around",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]
        clear = options["clear"]
        anchor_username = options["anchor_username"]

        if clear:
            deleted, _ = User.objects.filter(username__startswith="peer_").delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} peer users"))

        if anchor_username:
            anchor = User.objects.filter(username=anchor_username, role="student").first()
            base_time = anchor.date_joined if anchor else timezone.now()
        else:
            # Prefer centering around an existing real student if present
            real_student = (
                User.objects.filter(role="student")
                .exclude(username__startswith="peer_")
                .order_by("-date_joined")
                .first()
            )
            base_time = real_student.date_joined if real_student else timezone.now()

        created = 0
        for (
            username,
            first,
            last,
            level,
            memory,
            focus,
            logic,
            login_interval,
            duration,
            failed,
            progress,
            abandoned,
            day_offset,
        ) in PEER_PROFILES:
            user, was_created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": "student",
                    "cognitive_level": level,
                    "has_taken_placement_test": True,
                    "email": f"{username}@example.com",
                },
            )
            if was_created:
                user.set_password(password)
                created += 1
            else:
                user.first_name = first
                user.last_name = last
                user.role = "student"
                user.cognitive_level = level
                user.has_taken_placement_test = True

            # date_joined is normally auto; set explicitly for cohort clustering
            joined = base_time + timedelta(days=day_offset, hours=day_offset)
            user.date_joined = joined
            # Abandoned demo peers: no entry for >30 days so the real rule marks them ترک‌کرده
            from analytics.services import ABANDONMENT_INACTIVITY_DAYS, AnalyticsService
            if abandoned:
                last_login = timezone.now() - timedelta(days=ABANDONMENT_INACTIVITY_DAYS + 5)
            else:
                last_login = timezone.now() - timedelta(days=1)
            user.last_login = last_login
            user.is_active = True
            user.save()
            User.objects.filter(pk=user.pk).update(
                date_joined=joined,
                last_login=last_login,
                is_active=True,
            )

            summary, _ = UserPerformanceSummary.objects.get_or_create(user=user)
            summary.avg_memory_score = memory
            summary.avg_focus_score = focus
            summary.avg_logic_score = logic
            summary.total_tests_completed = max(failed + 2, 3)
            summary.avg_login_interval_days = login_interval
            summary.duration_of_use_minutes = duration
            summary.failed_tests_count = failed
            summary.progress_rate = progress
            summary.save()
            AnalyticsService.evaluate_abandonment(user, summary=summary, save=True)
            summary.refresh_from_db()
            user.refresh_from_db()

            # Linked CSV-aligned tracking row
            UserAbandonmentSample.objects.create(
                user=user,
                avg_login_interval_days=login_interval,
                duration_of_use_minutes=duration,
                failed_tests_count=failed,
                progress_rate=progress,
                abandoned=summary.abandoned,
                is_synthetic=True,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(PEER_PROFILES)} peer users "
                f"(newly created={created}) around {base_time.isoformat()} "
                f"password={password}"
            )
        )
