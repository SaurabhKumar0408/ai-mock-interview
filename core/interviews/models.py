from django.db import models
from django.conf import settings

# Create your models here.
class InterviewSession(models.Model):
    INTERVIEW_TYPES = [
        ('hr', 'HR / Behavioral'),
        ('dsa', 'DSA / Coding'),
        ('system_design', 'System Design'),
        ('domain', 'Domain Specific'),
    ]

    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
    ]
    DIFFICULTY_CHOICES = [
    ('easy', 'Easy'),
    ('medium', 'Medium'),
    ('hard', 'Hard'),
]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )

    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES)
    target_role = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    overall_score = models.IntegerField(null=True, blank=True)
    overall_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.interview_type}"
    

class Question(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='questions'
    )

    text = models.TextField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}"
    
class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name = 'answer')

    text = models.TextField(blank=True)
    audio_file = models.FileField(upload_to='answers/audio/', blank=True, null=True)
    ai_feedback = models.TextField(blank=True)
    score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to Q{self.question.order}"