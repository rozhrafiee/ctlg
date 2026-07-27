# Generated manually for engagement CSV fields + UserAbandonmentSample

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserAbandonmentSample',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avg_login_interval_days', models.FloatField()),
                ('duration_of_use_minutes', models.FloatField()),
                ('failed_tests_count', models.PositiveIntegerField()),
                ('progress_rate', models.FloatField(help_text='Learning progress rate between 0 and 1')),
                ('abandoned', models.BooleanField()),
                ('is_synthetic', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    blank=True,
                    help_text='Optional link when the sample mirrors a real user snapshot',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='abandonment_samples',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'User abandonment sample',
                'verbose_name_plural': 'User abandonment samples',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='userperformancesummary',
            name='avg_login_interval_days',
            field=models.FloatField(default=0, help_text='Average days between logins (CSV: avg_login_interval_days)'),
        ),
        migrations.AddField(
            model_name='userperformancesummary',
            name='duration_of_use_minutes',
            field=models.FloatField(default=0, help_text='Total/typical usage duration in minutes (CSV: duration_of_use_minutes)'),
        ),
        migrations.AddField(
            model_name='userperformancesummary',
            name='failed_tests_count',
            field=models.PositiveIntegerField(default=0, help_text='Number of failed tests (CSV: failed_tests_count)'),
        ),
        migrations.AddField(
            model_name='userperformancesummary',
            name='progress_rate',
            field=models.FloatField(default=0, help_text='Learning progress rate between 0 and 1 (CSV: progress_rate)'),
        ),
        migrations.AddField(
            model_name='userperformancesummary',
            name='abandoned',
            field=models.BooleanField(default=False, help_text='Whether the user abandoned the system (CSV: abandoned)'),
        ),
    ]
