from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    LessonView,
    QuizView,
    UserProgressView,
)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('topics/<int:topic_id>/lesson/', LessonView.as_view(), name='lesson'),
    path('topics/<int:topic_id>/quiz/', QuizView.as_view(), name='quiz'),
    path('progress/', UserProgressView.as_view(), name='user-progress'),
]