from django.contrib import admin
from .models import InterviewSession, Question, Answer

# Register your models here.
@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'interview_type', 'target_role', 'status', 'overall_score', 'created_at']
    list_filter = ['interview_type', 'status']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'order', 'text']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'score', 'created_at']