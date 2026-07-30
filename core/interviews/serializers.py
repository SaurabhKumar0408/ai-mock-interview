from rest_framework import serializers
from .models import InterviewSession, Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'audio_file', 'ai_feedback', 'score', 'created_at']
        read_only_fields = ['ai_feedback', 'score', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    answer = AnswerSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'answer']

class InterviewSessionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = InterviewSession
        fields = [
            'id', 'interview_type', 'target_role', 'difficulty', 'status',
            'overall_score', 'overall_feedback', 'created_at', 'questions'
        ]
        read_only_fields = ['status', 'overall_score', 'overall_feedback', 'created_at']

class StartInterviewSerializer(serializers.Serializer):
    interview_type = serializers.ChoiceField(
        choices=['hr', 'dsa', 'system_design', 'domain']
    )
    target_role = serializers.CharField(
        max_length=100,
        required=False,
        default='Software Engineer'
    )
    difficulty = serializers.ChoiceField(
        choices=['easy', 'medium', 'hard'],
        required=False,
        default='medium'
    )

class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    text = serializers.CharField(required=False, allow_blank=True)
    audio_file = serializers.FileField(required=False)

    def validate(self, data):
        if not data.get('text') and not data.get('audio_file'):
            raise serializers.ValidationError(
                "Please provide either a text or audio answer."
            )
        return data