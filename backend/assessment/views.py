# assessment/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Count
from django.utils import timezone
from datetime import timedelta

from analytics.views import IsTeacherRole
from .models import CognitiveTest, TestSession, Question, Choice, Answer
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


# ==================== Views برای دانشجو ====================

class CognitiveTestListView(generics.ListAPIView):
    """لیست آزمون‌های قابل دسترسی برای دانشجو"""
    serializer_class = CognitiveTestListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # فقط student می‌تواند آزمون ببیند
        if getattr(self.request.user, "role", "") != "student":
            return CognitiveTest.objects.none()
        
        user_level = getattr(self.request.user, "cognitive_level", 1)
        
        # آزمون‌های تعیین سطح را جدا می‌کنیم
        return CognitiveTest.objects.filter(
            is_active=True, 
            is_placement_test=False,
            min_level__lte=user_level, 
            max_level__gte=user_level
        )


class CognitiveTestDetailView(generics.RetrieveAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestSessionListView(generics.ListAPIView):
    serializer_class = TestSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user).order_by(
            "-started_at"
        )


class TestSessionDetailView(generics.RetrieveAPIView):
    serializer_class = TestResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestSession.objects.filter(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def start_session(request, pk: int):
    # فقط student می‌تواند آزمون بدهد
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    test = get_object_or_404(CognitiveTest, pk=pk, is_active=True)
    
    # بررسی آیا قبلاً این آزمون تعیین سطح را داده
    if test.is_placement_test:
        if getattr(request.user, "has_taken_placement_test", False):
            return Response(
                {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # بررسی اینکه آیا کاربر قبلاً این آزمون را شروع کرده
    existing_session = TestSession.objects.filter(
        user=request.user,
        test=test,
        finished_at__isnull=True
    ).first()
    
    if existing_session:
        return Response({
            "session_id": existing_session.id,
            "test_title": test.title,
            "started_at": existing_session.started_at,
            "is_placement_test": test.is_placement_test,
            "message": "شما یک جلسه فعال برای این آزمون دارید."
        })
    
    # ایجاد جلسه جدید
    session = TestSession.objects.create(user=request.user, test=test)
    
    return Response({
        "session_id": session.id,
        "test_title": test.title,
        "started_at": session.started_at,
        "is_placement_test": test.is_placement_test,
        "message": "آزمون شروع شد."
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_session(request, session_id: int):
    # فقط student می‌تواند آزمون بدهد
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    session = get_object_or_404(TestSession, pk=session_id, user=request.user)
    
    # بررسی آیا قبلاً ارسال شده
    if session.finished_at is not None:
        return Response(
            {"detail": "این آزمون قبلاً تکمیل شده است."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = SubmitSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # تصحیح آزمون
    session = grade_session(session, serializer.validated_data["answers"])
    
    # بررسی آیا سطح افزایش یافته
    old_level = getattr(request.user, "cognitive_level", 1)
    # refresh the user instance to pick up updates made during grading
    request.user.refresh_from_db()
    new_level = getattr(request.user, "cognitive_level", 1)
    
    return Response({
        "session": TestSessionSerializer(session).data,
        "level_increased": new_level > old_level,
        "old_level": old_level,
        "new_level": new_level,
        "message": "آزمون با موفقیت تصحیح شد." + 
                  (" تبریک! سطح شما افزایش یافت." if new_level > old_level else "")
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_placement_test(request):
    """دریافت آزمون تعیین سطح اولیه"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون تعیین سطح بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # بررسی آیا کاربر قبلاً آزمون تعیین سطح داده
    if getattr(request.user, "has_taken_placement_test", False):
        return Response(
            {"detail": "شما قبلاً آزمون تعیین سطح داده‌اید."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # پیدا کردن آزمون تعیین سطح
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
@permission_classes([permissions.IsAuthenticated])
def user_progress(request):
    """پیشرفت ساده کاربر"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان دارای پیشرفت هستند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user = request.user
    sessions = TestSession.objects.filter(
        user=user, 
        finished_at__isnull=False
    ).select_related('test')
    
    placement_session = sessions.filter(test__is_placement_test=True).first()
    regular_sessions = sessions.filter(test__is_placement_test=False)
    
    # محاسبه آمار
    total_sessions = regular_sessions.count()
    average_score = regular_sessions.aggregate(avg=Avg('total_score'))['avg'] or 0
    best_score = regular_sessions.aggregate(max=Max('total_score'))['max'] or 0
    
    return Response({
        "user": {
            "username": user.username,
            "current_level": getattr(user, "cognitive_level", 1),
            "has_taken_placement_test": getattr(user, "has_taken_placement_test", False),
            "placement_score": placement_session.total_score if placement_session else None,
        },
        "stats": {
            "total_tests_taken": total_sessions,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "tests_with_level_up": sessions.filter(
                resulting_level__gt=getattr(user, "cognitive_level", 1) - 1
            ).count(),
        },
        "recent_tests": [
            {
                "test_title": s.test.title,
                "score": round(s.total_score, 1),
                "date": s.finished_at,
                "is_placement": s.test.is_placement_test,
            }
            for s in sessions.order_by('-finished_at')[:5]
        ]
    })


# ==================== ویوهای مدرسان ====================

class CognitiveTestCreateView(generics.CreateAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherRole]


class CognitiveTestUpdateView(generics.UpdateAPIView):
    queryset = CognitiveTest.objects.all()
    serializer_class = CognitiveTestCreateSerializer
    permission_classes = [IsTeacherRole]


@api_view(["POST"])
@permission_classes([IsTeacherRole])
def add_question_to_test(request, test_id: int):
    test = get_object_or_404(CognitiveTest, pk=test_id)
    serializer = QuestionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    question = Question.objects.create(test=test, **serializer.validated_data)
    
    from .serializers import QuestionSerializer
    return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)


# ==================== Views جدید برای آزمون‌های محتوا ====================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_content_test_recommendation(request, content_id):
    """دریافت آزمون توصیه شده برای یک محتوا"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        content = LearningContent.objects.get(id=content_id, is_active=True)
        
        # بررسی پیشرفت محتوا
        try:
            progress = UserContentProgress.objects.get(user=request.user, content=content)
            if progress.progress_percent < 70:  # حداقل 70% پیشرفت
                return Response({
                    'has_recommendation': False,
                    'message': 'برای شرکت در آزمون، باید حداقل 70% از محتوا را مطالعه کرده باشید.',
                    'current_progress': progress.progress_percent
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
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def take_content_test(request, content_id):
    """شرکت در آزمون مرتبط با یک محتوا"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند آزمون بدهند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
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
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsTeacherRole])
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
                'error': 'برای این محتوا قبلاً آزمون ایجاد شده است.',
                'test_id': existing_test.id,
                'test_title': existing_test.title
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsTeacherRole])
def get_teacher_tests(request):
    """دریافت همه آزمون‌ها برای مدرس (شامل تعیین سطح)"""
    tests = CognitiveTest.objects.all().order_by('-created_at')
    serializer = CognitiveTestListSerializer(tests, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsTeacherRole])
def delete_test(request, pk):
    """حذف آزمون توسط مدرس"""
    test = get_object_or_404(CognitiveTest, pk=pk)
    test.delete()
    return Response({'message': 'آزمون با موفقیت حذف شد.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsTeacherRole])
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
@permission_classes([IsTeacherRole])
def get_test_questions(request, test_id):
    """دریافت سوالات یک آزمون"""
    test = get_object_or_404(CognitiveTest, pk=test_id)
    questions = test.questions.all()
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsTeacherRole])
def delete_question(request, question_id):
    """حذف سوال"""
    question = get_object_or_404(Question, pk=question_id)
    question.delete()
    return Response({'message': 'سوال با موفقیت حذف شد.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_student_dashboard(request):
    """دریافت داشبورد دانشجو"""
    if getattr(request.user, "role", "") != "student":
        return Response(
            {"detail": "فقط دانش‌آموزان می‌توانند داشبورد ببینند."},
            status=status.HTTP_403_FORBIDDEN
        )
    
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
        
        return Response({
            'stats': {
                'total_tests_taken': total_tests,
                'passed_tests': passed_tests,
                'pass_rate': round((passed_tests / total_tests * 100), 2) if total_tests > 0 else 0,
                'average_score': round(average_score, 2),
                'best_score': round(best_score, 2),
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
            ]
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )