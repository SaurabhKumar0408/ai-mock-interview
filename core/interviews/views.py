from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import InterviewSession, Question, Answer
from .serializers import InterviewSessionSerializer, StartInterviewSerializer, SubmitAnswerSerializer

from ai_engine.question_generator import generate_questions
from ai_engine.answer_evaluator import evaluate_answer
from ai_engine.speech import transcribe_audio

# Create your views here.

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartInterviewSerializer(data = request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        
        interview_type = serializer.validated_data['interview_type']
        target_role = serializer.validated_data['target_role']

        difficulty = serializer.validated_data['difficulty']

        session = InterviewSession.objects.create(
            user=request.user,
            interview_type=interview_type,
            target_role=target_role,
            difficulty=difficulty,
        )

        try:
            questions = generate_questions(interview_type, target_role, difficulty)
        except Exception as e:
            session.delete()
            return Response(
                {'error' : f'Failed to generate questions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        for i, q_text in enumerate(questions, start=1):
            Question.objects.create(
                session=session,
                text=q_text,
                order=i
            )
        
        out_serializer = InterviewSessionSerializer(session)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(
            InterviewSession,
            id = session_id,
            user = request.user
        )

        serializer = SubmitAnswerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question_id = serializer.validated_data['question_id']
        answer_text = serializer.validated_data.get('text', '')
        audio_file = serializer.validated_data.get('audio_file')

        question = get_object_or_404(
            Question,
            id=question_id,
            session=session
        )

        if hasattr(question, 'answer'):
            return Response(
                {'error' : 'You already answered this question.'},
                status = status.HTTP_400_BAD_REQUEST
            )
        
        if audio_file:
            answer_obj = Answer.objects.create(
                question=question,
                audio_file=audio_file,
            )
            try:
                answer_text = transcribe_audio(answer_obj.audio_file.path)
                answer_obj.text = answer_text
                answer_obj.save()
            except Exception as e:
                answer_obj.delete()
                return Response(
                    {'error': f'Transcription failed: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            answer_obj = Answer.objects.create(
                question=question,
                text=answer_text,
            )

        try:
            feedback = evaluate_answer(
                question.text,
                answer_text,
                session.interview_type
            )
            answer_obj.ai_feedback = str(feedback)
            answer_obj.score = feedback.get('score', 5)
            answer_obj.save()
        except Exception as e:
            return Response(
                {'error': f'Evaluation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'question': question.text,
            'your_answer': answer_text,
            'feedback': feedback,
        }, status=status.HTTP_200_OK)

class CompleteInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        # get the session
        session = get_object_or_404(
            InterviewSession,
            id=session_id,
            user=request.user
        )

        # check if already completed
        if session.status == 'completed':
            return Response(
                {'error': 'Interview already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # get all answers for this session
        answers = Answer.objects.filter(question__session=session)

        if not answers.exists():
            return Response(
                {'error': 'No answers submitted yet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # calculate average score
        scores = [a.score for a in answers if a.score is not None]
        overall_score = round(sum(scores) / len(scores)) if scores else 0

        # mark session as completed
        session.status = 'completed'
        session.overall_score = overall_score
        session.overall_feedback = f"You completed {answers.count()} questions with an average score of {overall_score}/10."
        session.save()

        return Response({
            'message': 'Interview completed!',
            'overall_score': overall_score,
            'total_questions': session.questions.count(),
            'answered': answers.count(),
        }, status=status.HTTP_200_OK)


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = InterviewSession.objects.filter(
            user=request.user
        ).order_by('-created_at')

        serializer = InterviewSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(
            InterviewSession,
            id=session_id,
            user=request.user
        )
        serializer = InterviewSessionSerializer(session)
        return Response(serializer.data)


class TranscribeAudioView(APIView):
    """
    POST /api/interviews/transcribe/
    Just transcribes audio and returns text.
    User can review before submitting.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        audio_file = request.FILES.get('audio_file')

        if not audio_file:
            return Response(
                {'error': 'No audio file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # save temporarily
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix='.webm'
        ) as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            text = transcribe_audio(tmp_path)
            return Response({'text': text})
        except Exception as e:
            return Response(
                {'error': f'Transcription failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            # clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)