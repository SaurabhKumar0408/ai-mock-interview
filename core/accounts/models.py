from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('professional', 'Professional'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    target_role = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.username
