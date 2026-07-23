"""
Generate synthetic training rows for user abandonment prediction.

Features:
  - avg_login_interval_days
  - duration_of_use_minutes
  - failed_tests_count
  - progress_rate (0–1)

Label:
  - abandoned (bool)
"""

from __future__ import annotations

import csv
import math
import random
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from analytics.models import UserAbandonmentSample


FEATURE_FIELDS = [
    'avg_login_interval_days',
    'duration_of_use_minutes',
    'failed_tests_count',
    'progress_rate',
    'abandoned',
]


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def generate_sample(rng: random.Random) -> dict:
    """
    Sample features with a learnable abandonment signal plus noise.

    Higher login gaps, more failed tests, lower usage duration, and lower
    progress increase abandonment probability.
    """
    avg_login_interval_days = round(rng.uniform(0.2, 45.0), 2)
    duration_of_use_minutes = round(rng.uniform(5.0, 600.0), 1)
    failed_tests_count = rng.randint(0, 25)
    progress_rate = round(rng.uniform(0.0, 1.0), 3)

    # Standardized-ish linear combination → abandonment probability
    logit = (
        -1.2
        + 0.09 * avg_login_interval_days
        - 0.004 * duration_of_use_minutes
        + 0.14 * failed_tests_count
        - 2.4 * progress_rate
        + rng.uniform(-0.35, 0.35)
    )
    abandon_prob = _sigmoid(logit)
    abandoned = rng.random() < abandon_prob

    return {
        'avg_login_interval_days': avg_login_interval_days,
        'duration_of_use_minutes': duration_of_use_minutes,
        'failed_tests_count': failed_tests_count,
        'progress_rate': progress_rate,
        'abandoned': abandoned,
    }


def generate_dataset(n: int, seed: int) -> list[dict]:
    rng = random.Random(seed)
    return [generate_sample(rng) for _ in range(n)]


class Command(BaseCommand):
    help = 'Generate synthetic abandonment-prediction samples and insert them into the database'

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
            rows = generate_dataset(count, seed)

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
                f'(abandoned={abandoned_n}, retained={retained_n}, seed={seed})'
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
