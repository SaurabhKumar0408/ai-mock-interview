from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Course, Topic, UserProgress
from .serializers import (
    CourseSerializer,
    TopicSerializer,
    UserProgressSerializer,
    SubmitQuizSerializer,
)
from ai_engine.lesson_generator import generate_lesson, generate_quiz


class CourseListView(APIView):
    """
    GET /api/learning/courses/
    Returns all courses with their topics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


class CourseDetailView(APIView):
    """
    GET /api/learning/courses/<course_id>/
    Returns a single course with topics
    and user progress for each topic.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseSerializer(course)

        # get user progress for all topics in this course
        progress = UserProgress.objects.filter(
            user=request.user,
            topic__course=course
        )
        progress_map = {
            p.topic_id: {
                'lesson_completed': p.lesson_completed,
                'quiz_completed': p.quiz_completed,
                'quiz_score': p.quiz_score,
            }
            for p in progress
        }

        # attach progress to each topic
        data = serializer.data
        for topic in data['topics']:
            topic['progress'] = progress_map.get(topic['id'], {
                'lesson_completed': False,
                'quiz_completed': False,
                'quiz_score': None,
            })

        # calculate overall course progress
        total_topics = len(data['topics'])
        completed_topics = sum(
            1 for t in data['topics']
            if t['progress']['lesson_completed']
        )
        data['progress_percent'] = round(
            (completed_topics / total_topics * 100)
            if total_topics > 0 else 0
        )

        return Response(data)


class LessonView(APIView):
    """
    GET /api/learning/topics/<topic_id>/lesson/
    Generates lesson content using Groq AI.
    Marks lesson as completed for the user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)

        # generate lesson via Groq
        try:
            lesson = generate_lesson(
                topic.title,
                topic.course.category
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate lesson: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # mark lesson as completed
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            topic=topic,
        )
        progress.lesson_completed = True
        progress.save()

        return Response({
            'topic': TopicSerializer(topic).data,
            'lesson': lesson,
            'progress': UserProgressSerializer(progress).data,
        })


class QuizView(APIView):
    """
    GET  /api/learning/topics/<topic_id>/quiz/
    Generates 5 MCQ questions using Groq AI.

    POST /api/learning/topics/<topic_id>/quiz/
    Submits answers, calculates score, saves progress.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)

        # check lesson completed first
        progress = UserProgress.objects.filter(
            user=request.user,
            topic=topic,
            lesson_completed=True
        ).first()

        if not progress:
            return Response(
                {'error': 'Please complete the lesson before taking the quiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # generate quiz via Groq
        try:
            quiz = generate_quiz(
                topic.title,
                topic.course.category
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to generate quiz: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'topic': TopicSerializer(topic).data,
            'quiz': quiz,
        })

    def post(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)

        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user_answers = serializer.validated_data['answers']
        correct_answers = serializer.validated_data.get('correct_answers', [])

        # calculate score
        if correct_answers and user_answers:
            correct_count = sum(
                1 for i, ans in enumerate(user_answers)
                if i < len(correct_answers) and ans == correct_answers[i]
            )
            score = round((correct_count / len(correct_answers)) * 10)
        else:
            score = 0

        # save progress
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            topic=topic,
        )
        progress.quiz_completed = True
        progress.quiz_score = score
        progress.save()

        return Response({
            'score': score,
            'correct_count': correct_count if correct_answers else 0,
            'total_questions': len(correct_answers) if correct_answers else 0,
            'progress': UserProgressSerializer(progress).data,
        })


class UserProgressView(APIView):
    """
    GET /api/learning/progress/
    Returns all learning progress for logged in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = UserProgress.objects.filter(
            user=request.user
        ).select_related('topic', 'topic__course')

        serializer = UserProgressSerializer(progress, many=True)

        # calculate overall stats
        total_lessons = progress.filter(lesson_completed=True).count()
        total_quizzes = progress.filter(quiz_completed=True).count()
        avg_quiz_score = 0

        quiz_scores = [
            p.quiz_score for p in progress
            if p.quiz_score is not None
        ]
        if quiz_scores:
            avg_quiz_score = round(sum(quiz_scores) / len(quiz_scores))

        return Response({
            'progress': serializer.data,
            'stats': {
                'lessons_completed': total_lessons,
                'quizzes_completed': total_quizzes,
                'avg_quiz_score': avg_quiz_score,
            }
        })