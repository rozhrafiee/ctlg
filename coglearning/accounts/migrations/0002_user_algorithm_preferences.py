# Generated migration for algorithm preferences on User model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="preferred_sort_algorithm",
            field=models.CharField(
                choices=[("bubble", "Bubble Sort"), ("merge", "Merge Sort")],
                default="bubble",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="preferred_search_algorithm",
            field=models.CharField(
                choices=[("linear", "Linear Search"), ("binary", "Binary Search")],
                default="linear",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="default_sort_field",
            field=models.CharField(
                choices=[
                    ("title", "عنوان"),
                    ("min_level", "سطح"),
                    ("time_limit_minutes", "زمان"),
                ],
                default="title",
                max_length=30,
            ),
        ),
    ]
