import speech_recognition as sr
from pydub import AudioSegment
import os


def transcribe_audio(audio_file_path):
    """
    Converts audio file to text using
    Google's free Speech Recognition API.
    """
    recognizer = sr.Recognizer()

    # convert audio to wav format first
    # because SpeechRecognition works best with wav
    wav_path = audio_file_path.replace('.webm', '.wav').replace('.mp3', '.wav')

    try:
        # convert to wav using pydub
        audio = AudioSegment.from_file(audio_file_path)
        audio.export(wav_path, format='wav')

        # transcribe
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)

        return text

    except sr.UnknownValueError:
        return "Could not understand the audio. Please try again."
    except sr.RequestError:
        return "Speech recognition service unavailable. Please type your answer."
    except Exception as e:
        return f"Transcription error: {str(e)}"
    finally:
        # clean up wav file
        if os.path.exists(wav_path):
            os.remove(wav_path)