"""
Generate synthetic training rows aligned with the live abandonment rule:

  abandoned = True  if  avg_login_interval_days >= ABANDONMENT_INACTIVITY_DAYS (30)
  abandoned = False otherwise

avg_login_interval_days here stands for days since last platform entry
(same metric used by AnalyticsService.evaluate_abandonment).

Secondary features are correlated for realism but do NOT define the label.
"""

from __future__ import annotations

import csv
import random
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from analytics.models import UserAbandonmentSample
from analytics.services import ABANDONMENT_INACTIVITY_DAYS


FEATURE_FIELDS = [
    'avg_login_interval_days',
    'duration_of_use_minutes',
    'failed_tests_count',
    'progress_rate',
    'abandoned',
]


def generate_sample(rng: random.Random, threshold_days: int = ABANDONMENT_INACTIVITY_DAYS) -> dict:
    """
    Generate one row under the 30-day inactivity rule.

    - Abandoned users: days since last entry in [threshold, threshold+60]
    - Active users: days since last entry in [0.2, threshold)
    Secondary fields are mildly correlated with abandonment for a learnable model.
    """
    will_abandon = rng.random() < 0.48  # near-balanced classes

    if will_abandon:
        # No entry for at least `threshold_days` days → ترک‌کرده
        avg_login_interval_days = round(rng.uniform(threshold_days, threshold_days + 60), 2)
        duration_of_use_minutes = round(rng.uniform(5.0, 180.0), 1)
        failed_tests_count = rng.randint(3, 25)
        progress_rate = round(rng.uniform(0.0, 0.55), 3)
    else:
        # Entered within the last `threshold_days` days → still active
        avg_login_interval_days = round(rng.uniform(0.2, threshold_days - 0.01), 2)
        duration_of_use_minutes = round(rng.uniform(60.0, 600.0), 1)
        failed_tests_count = rng.randint(0, 12)
        progress_rate = round(rng.uniform(0.35, 1.0), 3)

    # Label is deterministic from the platform rule
    abandoned = avg_login_interval_days >= threshold_days

    return {
        'avg_login_interval_days': avg_login_interval_days,
        'duration_of_use_minutes': duration_of_use_minutes,
        'failed_tests_count': failed_tests_count,
        'progress_rate': progress_rate,
        'abandoned': abandoned,
    }


def generate_dataset(n: int, seed: int, threshold_days: int = ABANDONMENT_INACTIVITY_DAYS) -> list[dict]:
    rng = random.Random(seed)
    return [generate_sample(rng, threshold_days=threshold_days) for _ in range(n)]


class Command(BaseCommand):
    help = (
        'Generate abandonment samples using the 30-day inactivity rule '
        'and insert them into the database'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=2000,
            help='Number of synthetic samples to generate (default: 2000)',
        )
        parser.add_argument(
            '--seed',
            type=int,
            default=42,
            help='RNG seed for reproducibility (default: 42)',
        )
        parser.add_argument(
            '--threshold-days',
            type=int,
            default=ABANDONMENT_INACTIVITY_DAYS,
            help=f'Inactivity days for ترک‌کرده (default: {ABANDONMENT_INACTIVITY_DAYS})',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing synthetic samples before inserting',
        )
        parser.add_argument(
            '--csv',
            type=str,
            default='',
            help='Optional path to also write a CSV export of the generated rows',
        )
        parser.add_argument(
            '--from-csv',
            type=str,
            default='',
            help='Load rows from an existing CSV instead of generating new ones',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options['count']
        seed = options['seed']
        threshold_days = options['threshold_days']
        clear = options['clear']
        csv_path = options['csv']
        from_csv = options['from_csv']

        if clear:
            deleted, _ = UserAbandonmentSample.objects.filter(is_synthetic=True).delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} existing synthetic samples'))

        if from_csv:
            path = Path(from_csv)
            with path.open(newline='', encoding='utf-8') as fh:
                reader = csv.DictReader(fh)
                rows = []
                for raw in reader:
                    abandoned_raw = raw['abandoned']
                    abandoned = abandoned_raw in ('1', 'true', 'True', True)
                    rows.append({
                        'avg_login_interval_days': float(raw['avg_login_interval_days']),
                        'duration_of_use_minutes': float(raw['duration_of_use_minutes']),
                        'failed_tests_count': int(float(raw['failed_tests_count'])),
                        'progress_rate': float(raw['progress_rate']),
                        'abandoned': abandoned,
                    })
            self.stdout.write(f'Loaded {len(rows)} rows from {path.resolve()}')
        else:
            rows = generate_dataset(count, seed, threshold_days=threshold_days)

        samples = [
            UserAbandonmentSample(
                avg_login_interval_days=row['avg_login_interval_days'],
                duration_of_use_minutes=row['duration_of_use_minutes'],
                failed_tests_count=row['failed_tests_count'],
                progress_rate=row['progress_rate'],
                abandoned=row['abandoned'],
                is_synthetic=True,
            )
            for row in rows
        ]
        UserAbandonmentSample.objects.bulk_create(samples, batch_size=500)

        abandoned_n = sum(1 for row in rows if row['abandoned'])
        retained_n = len(rows) - abandoned_n
        self.stdout.write(
            self.style.SUCCESS(
                f'Inserted {len(rows)} samples '
                f'(abandoned={abandoned_n}, retained={retained_n}, '
                f'threshold={threshold_days}d, seed={seed})'
            )
        )

        if csv_path:
            path = Path(csv_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            export_rows = [
                {
                    **row,
                    'abandoned': int(bool(row['abandoned'])),
                }
                for row in rows
            ]
            with path.open('w', newline='', encoding='utf-8') as fh:
                writer = csv.DictWriter(fh, fieldnames=FEATURE_FIELDS)
                writer.writeheader()
                writer.writerows(export_rows)
            self.stdout.write(self.style.SUCCESS(f'Wrote CSV to {path.resolve()}'))
