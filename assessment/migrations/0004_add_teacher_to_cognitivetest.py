# Generated manually for teacher field on CognitiveTest

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('assessment', '0003_alter_question_options_question_correct_text_answer'),
    ]

    operations = [
        migrations.AddField(
            model_name='cognitivetest',
            name='teacher',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='authored_tests',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
