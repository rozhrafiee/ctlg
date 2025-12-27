from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Count
from django.utils import timezone
from datetime import timedelta
import logging

from .permissions import IsTeacherForAssessment, IsStudentForAssessment
from .models import CognitiveTest, TestSession, Question, Choice, Answer, ContentTestProgress
from .serializers import (
    QuestionSerializer,
    CognitiveTestListSerializer,
    CognitiveTestDetailSerializer,
    CognitiveTestCreateSerializer,
    TestSessionSerializer,
    SubmitSessionSerializer,
    QuestionCreateSerializer,
    TestResultSerializer,
)
from .services import grade_session
from adaptive_learning.models import LearningContent, UserContentProgress

logger = logging.getLogger(__name__)

# ==================== Views برای دانشجو ====================

class CognitiveTestListView(generics.ListAPIView):
    """لیست آزمون‌های قابل دسترسی برای دانشجو"""
    serializer_class = CognitiveTestListSerializer
    permission_classes = [IsStudentForAssessment]

    def get_queryset(self):
        user_level = getattr(self.request.user, "cognitive_level", 1)
        
        # آزمون‌های تعیین سطح را جدا می‌کنیم
        return CognitiveTest.objects.filter(
            is_active=True, 
            is_placement_test=False,
            min_level__lte=user_level, 
            max_level__gte=user_level
        ).order_by('min_level', '-created_at')


class CognitiveTestDetailView(generics.RetrieveAPIView):
    """جزئیات یک آزمون"""
    serializer_class = CognitiveTestDetailSerializer
    permission_classes = [IsStudentForAssessment]
    
    def get_queryset(self):
        user_level = getattr(self.request.user, "cognitive_level", 1)
        return CognitiveTest.objects.filter(
            is_active=True,
            min_level__lte=user_level,
            max_level__gte=user_level
        )


class TestSessionListView(generics.ListAPIView):
    """لیست جلسات آزمون کاربر"""
    serializer_class = TestSessionSerializer
    permission_classes = [IsStudentForAssessment]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user).order_by(
            "-started_at"
        )


class TestSessionDetailView(generics.RetrieveAPIView):
    """جزئیات یک جلسه آزمون"""
    serializer_class = TestResultSerializer
    permission_classes = [IsStudentForAssessment]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([IsStudentForAssessment])
def start_session(request, pk: int):
    """شروع یک جلسه آزمون جدید"""
    test = get_object_or_404(CognitiveTest, pk=pk, is_active=True)
    
    # بررسی آیا آزمون تعیین سطح است
    if test.is_placement_test:
        if getattr(request.user, "has_taken_placement_test", False):
            return Response(
                {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        # بررسی سطح کاربر برای آزمون‌های عادی
        user_level = getattr(request.user, "cognitive_level", 1)
        if not (test.min_level <= user_level <= test.max_level):
            return Response(
                {"detail": "سطح شناختی شما برای این آزمون مناسب نیست."},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # بررسی اینکه آیا کاربر قبلاً این آزمون را شروع کرده
    existing_session = TestSession.objects.filter(
        user=request.user,
        test=test,
        status='in_progress'
    ).first()
    
    if existing_session:
        # بررسی انقضا
        if existing_session.expires_at and existing_session.expires_at < timezone.now():
            existing_session.status = 'timeout'
            existing_session.save()
        else:
            return Response({
                "session_id": existing_session.id,
                "test_title": test.title,
                "started_at": existing_session.started_at,
                "expires_at": existing_session.expires_at,
                "message": "شما یک جلسه فعال برای این آزمون دارید."
            })
    
    # ایجاد جلسه جدید
    expires_at = None
    if test.time_limit_minutes > 0:
        expires_at = timezone.now() + timedelta(minutes=test.time_limit_minutes)
    
    session = TestSession.objects.create(
        user=request.user, 
        test=test,
        expires_at=expires_at
    )
    
    return Response({
        "session_id": session.id,
        "test": {
            "id": test.id,
            "title": test.title,
            "description": test.description,
            "time_limit_minutes": test.time_limit_minutes,
            "total_questions": test.total_questions,
            "passing_score": test.passing_score
        },
        "started_at": session.started_at,
        "expires_at": session.expires_at,
        "is_placement_test": test.is_placement_test,
        "message": "آزمون شروع شد."
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsStudentForAssessment])
def submit_session(request, session_id: int):
    """ارسال پاسخ‌های آزمون"""
    session = get_object_or_404(TestSession, pk=session_id, user=request.user)
    
    # بررسی آیا قبلاً ارسال شده
    if session.finished_at is not None:
        return Response(
            {"detail": "این آزمون قبلاً تکمیل شده است."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # بررسی زمان انقضا
    if session.expires_at and session.expires_at < timezone.now():
        session.status = 'timeout'
        session.save()
        return Response(
            {"detail": "زمان آزمون به پایان رسیده است."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = SubmitSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # تصحیح آزمون
    try:
        session = grade_session(session, serializer.validated_data["answers"])
        
        # بررسی افزایش سطح
        old_level = getattr(request.user, "cognitive_level", 1)
        request.user.refresh_from_db()
        new_level = getattr(request.user, "cognitive_level", 1)
        
        # محاسبه زمان صرف شده
        if session.started_at and session.finished_at:
            time_spent = session.finished_at - session.started_at
            session.time_spent_seconds = int(time_spent.total_seconds())
            session.save()
        
        return Response({
            "session": TestSessionSerializer(session).data,
            "level_increased": new_level > old_level,
            "old_level": old_level,
            "new_level": new_level,
            "message": "آزمون با موفقیت تصحیح شد." + 
                      (" تبریک! سطح شما افزایش یافت." if new_level > old_level else "")
        })
    except Exception as e:
        logger.error(f"Error grading session {session_id}: {str(e)}")
        return Response(
            {"detail": "خطا در تصحیح آزمون"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsStudentForAssessment])
def get_placement_test(request):
    """دریافت آزمون تعیین سطح اولیه"""
    # بررسی آیا کاربر قبلاً آزمون تعیین سطح داده
    if getattr(request.user, "has_taken_placement_test", False):
        return Response(
            {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # پیدا کردن آزمون تعیین سطح فعال
    placement_test = CognitiveTest.objects.filter(
        is_active=True, is_placement_test=True
    ).first()
    
    if not placement_test:
        return Response(
            {"detail": "آزمون تعیین سطح یافت نشد."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CognitiveTestDetailSerializer(placement_test)
    return Response({
        "test": serializer.data,
        "message": "آزمون تعیین سطح اولیه"
    })


@api_view(["GET"])
@permission_classes([IsStudentForAssessment])
def user_progress(request):
    """پیشرفت کلی کاربر"""
    user = request.user
    sessions = TestSession.objects.filter(
        user=user, 
        finished_at__isnull=False
    ).select_related('test')
    
    placement_session = sessions.filter(test__is_placement_test=True).first()
    regular_sessions = sessions.filter(test__is_placement_test=False)
    
    # محاسبه آمار
    total_sessions = regular_sessions.count()
    passed_sessions = regular_sessions.filter(passed=True).count()
    average_score = regular_sessions.aggregate(avg=Avg('total_score'))['avg'] or 0
    best_score = regular_sessions.aggregate(max=Max('total_score'))['max'] or 0
    
    return Response({
        "user": {
            "username": user.username,
            "email": user.email,
            "current_level": getattr(user, "cognitive_level", 1),
            "has_taken_placement_test": getattr(user, "has_taken_placement_test", False),
            "placement_score": placement_session.total_score if placement_session else None,
        },
        "stats": {
            "total_tests_taken": total_sessions,
            "passed_tests": passed_sessions,
            "pass_rate": round((passed_sessions / total_sessions * 100), 1) if total_sessions > 0 else 0,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "tests_with_level_up": sessions.filter(
                resulting_level__gt=getattr(user, "cognitive_level", 1) - 1
            ).count(),
        },
        "recent_tests": [
            {
                "test_id": s.test.id,
                "test_title": s.test.title,
                "score": round(s.total_score, 1),
                "passed": s.passed,
                "date": s.finished_at,
                "is_placement": s.test.is_placement_test,
            }
            for s in sessions.order_by('-finished_at')[:5]
        ]
    })


@api_view(['GET'])
@permission_classes([IsStudentForAssessment])
def get_student_dashboard(request):
    """دریافت داشبورد دانشجو"""
    try:
        user = request.user
        sessions = TestSession.objects.filter(
            user=user, 
            finished_at__isnull=False
        ).select_related('test')
        
        # محاسبه آمار
        total_tests = sessions.count()
        passed_tests = sessions.filter(passed=True).count()
        average_score = sessions.aggregate(avg=Avg('total_score'))['avg'] or 0
        best_score = sessions.aggregate(max=Max('total_score'))['max'] or 0
        
        # محتوای در حال یادگیری
        learning_content = UserContentProgress.objects.filter(
            user=user,
            progress_percent__lt=100
        ).select_related('content').order_by('-last_accessed')[:3]
        
        return Response({
            'stats': {
                'total_tests_taken': total_tests,
                'passed_tests': passed_tests,
                'pass_rate': round((passed_tests / total_tests * 100), 2) if total_tests > 0 else 0,
                'average_score': round(average_score, 2),
                'best_score': round(best_score, 2),
                'learning_contents': learning_content.count(),
            },
            'current_level': getattr(user, 'cognitive_level', 1),
            'has_taken_placement_test': getattr(user, 'has_taken_placement_test', False),
            'recent_tests': [
                {
                    'test_id': s.test.id,
                    'test_title': s.test.title,
                    'score': round(s.total_score, 2),
                    'passed': s.passed,
                    'date': s.finished_at,
                }
                for s in sessions.order_by('-finished_at')[:5]
            ],
            'in_progress_content': [
                {
                    'content_id': progress.content.id,
                    'content_title': progress.content.title,
                    'progress_percent': progress.progress_percent,
                    'last_accessed': progress.last_accessed,
                }
                for progress in learning_content
            ]
        })
    except Exception as e:
        logger.error(f"Error in student dashboard: {str(e)}")
        return Response(
            {'error': 'خطا در دریافت اطلاعات داشبورد'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== ویوهای مدرسان ====================

class CognitiveTestCreateView(generics.CreateAPIView):
    """ایجاد آزمون جدید توسط مدرس"""
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherForAssessment]


class CognitiveTestUpdateView(generics.UpdateAPIView):
    """ویرایش آزمون توسط مدرس"""
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherForAssessment]
    
    def get_object(self):
        pk = self.kwargs.get('pk')
        return get_object_or_404(CognitiveTest, pk=pk)


@api_view(["POST"])
@permission_classes([IsTeacherForAssessment])
def add_question_to_test(request, test_id: int):
    """افزودن سوال به آزمون"""
    test = get_object_or_404(CognitiveTest, pk=test_id)
    serializer = QuestionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # ایجاد سوال با داده‌های معتبر
    validated_data = serializer.validated_data.copy()
    choices_data = validated_data.pop("choices", [])
    
    question = Question.objects.create(test=test, **validated_data)
    
    # ایجاد گزینه‌ها برای سوالات MCQ
    if question.question_type == "mcq" and choices_data:
        for i, choice_data in enumerate(choices_data):
            if 'order' not in choice_data:
                choice_data['order'] = i
            Choice.objects.create(question=question, **choice_data)
    
    return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsTeacherForAssessment])
def get_teacher_tests(request):
    """دریافت همه آزمون‌ها برای مدرس"""
    tests = CognitiveTest.objects.all().order_by('-created_at')
    serializer = CognitiveTestListSerializer(tests, many=True)
    return Response({
        'count': tests.count(),
        'results': serializer.data
    })


@api_view(['DELETE'])
@permission_classes([IsTeacherForAssessment])
def delete_test(request, pk):
    """حذف آزمون توسط مدرس"""
    test = get_object_or_404(CognitiveTest, pk=pk)
    test_title = test.title
    
    # بررسی اینکه آیا آزمون در حال استفاده است
    if test.testsession_set.exists():
        return Response({
            'error': 'این آزمون توسط کاربران استفاده شده و نمی‌توان حذف کرد.',
            'sessions_count': test.testsession_set.count()
        }, status=status.HTTP_400_BAD_REQUEST)
    
    test.delete()
    return Response({
        'message': f'آزمون "{test_title}" با موفقیت حذف شد.'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsTeacherForAssessment])
def create_placement_test(request):
    """ایجاد آزمون تعیین سطح جدید توسط مدرس"""
    data = request.data.copy()
    data['is_placement_test'] = True
    data['min_level'] = 1
    data['max_level'] = 10
    
    serializer = CognitiveTestCreateSerializer(data=data)
    if serializer.is_valid():
        test = serializer.save()
        return Response({
            'success': True,
            'message': 'آزمون تعیین سطح با موفقیت ایجاد شد.',
            'test': CognitiveTestDetailSerializer(test).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsTeacherForAssessment])
def get_test_questions(request, test_id):
    """دریافت سوالات یک آزمون"""
    test = get_object_or_404(CognitiveTest, pk=test_id)
    questions = test.questions.all().order_by('order')
    serializer = QuestionSerializer(questions, many=True)
    return Response({
        'test': {
            'id': test.id,
            'title': test.title,
            'total_questions': test.total_questions,
        },
        'questions': serializer.data,
        'count': questions.count()
    })


@api_view(['DELETE'])
@permission_classes([IsTeacherForAssessment])
def delete_question(request, question_id):
    """حذف سوال"""
    question = get_object_or_404(Question, pk=question_id)
    question_text = question.text[:50]
    test_title = question.test.title
    
    question.delete()
    return Response({
        'message': f'سوال "{question_text}..." از آزمون "{test_title}" با موفقیت حذف شد.'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsTeacherForAssessment])
def get_test_statistics(request, test_id):
    """آمار و تحلیل یک آزمون"""
    test = get_object_or_404(CognitiveTest, pk=test_id)
    
    sessions = TestSession.objects.filter(
        test=test,
        finished_at__isnull=False
    ).select_related('user')
    
    total_sessions = sessions.count()
    passed_sessions = sessions.filter(passed=True).count()
    
    # آمار نمرات
    if total_sessions > 0:
        score_stats = sessions.aggregate(
            avg_score=Avg('total_score'),
            max_score=Max('total_score'),
            min_score=Avg('total_score')  # باید Min باشد، اما برای نمونه
        )
        
        # توزیع نمرات
        score_distribution = {}
        for i in range(0, 101, 10):
            lower = i
            upper = i + 9 if i < 90 else 100
            count = sessions.filter(
                total_score__gte=lower,
                total_score__lte=upper
            ).count()
            score_distribution[f'{lower}-{upper}'] = count
    else:
        score_stats = {'avg_score': 0, 'max_score': 0, 'min_score': 0}
        score_distribution = {}
    
    # سوالات مشکل‌دار
    questions = test.questions.all()
    question_stats = []
    for question in questions:
        answers = Answer.objects.filter(
            question=question,
            session__test=test
        )
        total_answers = answers.count()
        correct_answers = answers.filter(score__gt=0).count()
        
        question_stats.append({
            'id': question.id,
            'text': question.text[:100],
            'total_answers': total_answers,
            'correct_answers': correct_answers,
            'accuracy': round((correct_answers / total_answers * 100), 1) if total_answers > 0 else 0
        })
    
    return Response({
        'test': {
            'id': test.id,
            'title': test.title,
            'total_questions': test.questions.count(),
            'passing_score': test.passing_score,
        },
        'sessions': {
            'total': total_sessions,
            'passed': passed_sessions,
            'pass_rate': round((passed_sessions / total_sessions * 100), 1) if total_sessions > 0 else 0,
        },
        'score_statistics': score_stats,
        'score_distribution': score_distribution,
        'question_analysis': sorted(question_stats, key=lambda x: x['accuracy'])[:5],  # 5 سوال با کمترین دقت
    })


# ==================== Views جدید برای آزمون‌های محتوا ====================

@api_view(['GET'])
@permission_classes([IsStudentForAssessment])
def get_content_test_recommendation(request, content_id):
    """دریافت آزمون توصیه شده برای یک محتوا"""
    try:
        content = LearningContent.objects.get(id=content_id, is_active=True)
        
        # بررسی پیشرفت محتوا
        try:
            progress = UserContentProgress.objects.get(user=request.user, content=content)
            if progress.progress_percent < 70:  # حداقل 70% پیشرفت
                return Response({
                    'has_recommendation': False,
                    'message': 'برای شرکت در آزمون، باید حداقل 70% از محتوا را مطالعه کرده باشید.',
                    'current_progress': progress.progress_percent,
                    'required_progress': 70
                })
        except UserContentProgress.DoesNotExist:
            return Response({
                'has_recommendation': False,
                'message': 'شما این محتوا را مطالعه نکرده‌اید.'
            })
        
        # پیدا کردن آزمون مرتبط
        test = CognitiveTest.objects.filter(
            related_content=content,
            is_active=True,
            min_level__lte=getattr(request.user, 'cognitive_level', 1),
            max_level__gte=getattr(request.user, 'cognitive_level', 1)
        ).first()
        
        if not test:
            return Response({
                'has_recommendation': False,
                'message': 'هنوز آزمون مرتبطی برای این محتوا ایجاد نشده است.'
            })
        
        # بررسی اینکه آیا کاربر قبلاً این آزمون را داده
        taken = TestSession.objects.filter(
            user=request.user,
            test=test,
            finished_at__isnull=False
        ).exists()
        
        serializer = CognitiveTestDetailSerializer(test)
        
        if taken:
            last_session = TestSession.objects.filter(
                user=request.user,
                test=test,
                finished_at__isnull=False
            ).order_by('-finished_at').first()
            
            return Response({
                'has_recommendation': True,
                'test': serializer.data,
                'already_taken': True,
                'last_score': last_session.total_score if last_session else None,
                'last_passed': last_session.passed if last_session else False,
                'last_taken_at': last_session.finished_at if last_session else None,
                'message': 'شما قبلاً این آزمون را داده‌اید.'
            })
        
        return Response({
            'has_recommendation': True,
            'test': serializer.data,
            'already_taken': False,
            'message': f'آزمون مرتبط با محتوای "{content.title}"'
        })
    
    except LearningContent.DoesNotExist:
        return Response({
            'has_recommendation': False,
            'message': 'محتوای آموزشی یافت نشد.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in content test recommendation: {str(e)}")
        return Response(
            {'error': 'خطا در دریافت اطلاعات آزمون'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsStudentForAssessment])
def take_content_test(request, content_id):
    """شرکت در آزمون مرتبط با یک محتوا"""
    try:
        content = LearningContent.objects.get(id=content_id, is_active=True)
        
        # بررسی پیشرفت محتوا
        try:
            progress = UserContentProgress.objects.get(user=request.user, content=content)
            if progress.progress_percent < 70:
                return Response({
                    'error': 'برای شرکت در آزمون، باید حداقل 70% از محتوا را مطالعه کرده باشید.',
                    'current_progress': progress.progress_percent,
                    'required_progress': 70
                }, status=status.HTTP_400_BAD_REQUEST)
        except UserContentProgress.DoesNotExist:
            return Response(
                {'error': 'شما این محتوا را مطالعه نکرده‌اید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # پیدا کردن آزمون مرتبط
        test = CognitiveTest.objects.filter(
            related_content=content,
            is_active=True,
            min_level__lte=getattr(request.user, 'cognitive_level', 1),
            max_level__gte=getattr(request.user, 'cognitive_level', 1)
        ).first()
        
        if not test:
            return Response(
                {'error': 'آزمون فعالی برای این محتوا یافت نشد.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # شروع آزمون
        return start_session(request, test.id)
    
    except LearningContent.DoesNotExist:
        return Response(
            {'error': 'محتوای آموزشی یافت نشد.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error taking content test: {str(e)}")
        return Response(
            {'error': 'خطا در شروع آزمون'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsTeacherForAssessment])
def create_content_test(request, content_id):
    """ایجاد آزمون جدید برای یک محتوا (برای استاد)"""
    try:
        content = LearningContent.objects.get(id=content_id)
        
        # بررسی اینکه آیا آزمون مرتبطی وجود دارد
        existing_test = CognitiveTest.objects.filter(
            related_content=content
        ).first()
        
        if existing_test:
            return Response({
                'warning': 'برای این محتوا قبلاً آزمون ایجاد شده است.',
                'test_id': existing_test.id,
                'test_title': existing_test.title
            })
        
        # داده‌های پیش‌فرض
        test_data = {
            'title': f"آزمون: {content.title}",
            'description': f"آزمون ارزیابی محتوای آموزشی: {content.description[:100]}" if content.description else "",
            'min_level': content.min_level,
            'max_level': content.max_level,
            'is_active': True,
            'is_placement_test': False,
            'related_content': content.id,
            'total_questions': 10,
            'passing_score': 70,
            'time_limit_minutes': 30,
        }
        
        serializer = CognitiveTestCreateSerializer(data=test_data)
        serializer.is_valid(raise_exception=True)
        test = serializer.save()
        
        return Response({
            'success': True,
            'message': 'آزمون با موفقیت ایجاد شد.',
            'test': CognitiveTestDetailSerializer(test).data
        }, status=status.HTTP_201_CREATED)
    
    except LearningContent.DoesNotExist:
        return Response(
            {'error': 'محتوای آموزشی یافت نشد.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error creating content test: {str(e)}")
        return Response(
            {'error': 'خطا در ایجاد آزمون'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )