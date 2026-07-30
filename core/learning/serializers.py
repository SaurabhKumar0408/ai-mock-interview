from rest_framework import serializers
from .models import Course, Topic, UserProgress


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'title', 'description', 'order']


class CourseSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    total_topics = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'icon', 'order', 'total_topics', 'topics']

    def get_total_topics(self, obj):
        return obj.topics.count()


class UserProgressSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    course_title = serializers.CharField(source='topic.course.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 'topic', 'topic_title', 'course_title',
            'lesson_completed', 'quiz_score', 'quiz_completed', 'completed_at'
        ]
        read_only_fields = ['completed_at']


class SubmitQuizSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.IntegerField()
    )
    correct_answers = serializers.ListField(
        child=serializers.IntegerField()
    )