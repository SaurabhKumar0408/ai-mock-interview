from django.db import models
from django.conf import settings

# Create your models here.
class Course(models.Model):
    CATEGORY_CHOICES = [
        ('hr', 'HR / Behavioral'),
        ('dsa', 'DSA / Coding'),
        ('system_design', 'System Design'),
        ('domain', 'Domain Specific'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon = models.CharField(max_length=10, default='📚')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['order']


class Topic(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='topics'
    )
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=300, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} → {self.title}"

    class Meta:
        ordering = ['order']


class UserProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    lesson_completed = models.BooleanField(default=False)
    quiz_score = models.IntegerField(null=True, blank=True)
    quiz_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        # one progress record per user per topic
        unique_together = ['user', 'topic']

    def __str__(self):
        return f"{self.user.username} → {self.topic.title}"