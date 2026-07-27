# Generated manually for algorithm preference fields on User

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='default_sort_field',
            field=models.CharField(
                blank=True,
                choices=[
                    ('title', 'عنوان'),
                    ('min_level', 'حداقل سطح'),
                    ('time_limit_minutes', 'مدت آزمون'),
                    ('created_at', 'تاریخ ایجاد'),
                ],
                default='title',
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='preferred_search_algorithm',
            field=models.CharField(
                blank=True,
                choices=[
                    ('linear', 'Linear Search'),
                    ('binary', 'Binary Search'),
                ],
                default='linear',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='preferred_sort_algorithm',
            field=models.CharField(
                blank=True,
                choices=[
                    ('bubble', 'Bubble Sort'),
                    ('merge', 'Merge Sort'),
                ],
                default='bubble',
                max_length=20,
            ),
        ),
    ]
