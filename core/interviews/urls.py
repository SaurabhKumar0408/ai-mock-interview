from django.urls import path
from .views import StartInterviewView, SubmitAnswerView, CompleteInterviewView, SessionDetailView, SessionListView, TranscribeAudioView


urlpatterns = [
    path('', SessionListView.as_view(), name='session_list'),
    path('start/', StartInterviewView.as_view(), name='start-interview'),
    path('transcribe/', TranscribeAudioView.as_view(), name='transcribe-audio'),
    path('<int:session_id>/', SessionDetailView.as_view(), name='session-detail'),
    path('<int:session_id>/answer/', SubmitAnswerView.as_view(), name='submit-answer'),
    path('<int:session_id>/complete/', CompleteInterviewView.as_view(), name='complete-interview'),
]