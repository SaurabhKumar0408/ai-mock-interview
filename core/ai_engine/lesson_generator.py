import json
from groq import Groq
from decouple import config

client = Groq(api_key=config('GROQ_API_KEY'))


def generate_lesson(topic_title, course_category):
    prompt = f"""
You are an expert educator creating a lesson for interview preparation.

Topic: {topic_title}
Category: {course_category}

Create a comprehensive lesson with this exact JSON structure:
{{
    "summary": "<2-3 sentence overview of this topic>",
    "key_points": [
        "<key point 1>",
        "<key point 2>",
        "<key point 3>",
        "<key point 4>",
        "<key point 5>"
    ],
    "explanation": "<detailed explanation of the topic in 3-4 paragraphs>",
    "example": "<a real world example or code example illustrating this topic>",
    "tips": [
        "<interview tip 1>",
        "<interview tip 2>",
        "<interview tip 3>"
    ]
}}

Rules:
- Return ONLY the JSON object
- No extra text before or after
- No markdown formatting
- No code blocks around the JSON
- Make content specific and practical for interview preparation
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an expert educator and interview coach. You create clear, practical and well structured lesson content."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=1500,
        temperature=0.5,
    )

    raw = response.choices[0].message.content.strip()

    # clean up if model wraps in ```json ... ```
    if raw.startswith("```"):
        lines = raw.split('\n')
        raw = '\n'.join(lines[1:-1])

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "summary": f"This lesson covers {topic_title}.",
            "key_points": ["Key concept 1", "Key concept 2", "Key concept 3"],
            "explanation": f"{topic_title} is an important topic for interviews.",
            "example": "Example will be provided soon.",
            "tips": ["Study regularly", "Practice with examples", "Review key concepts"]
        }


def generate_quiz(topic_title, course_category):
    prompt = f"""
You are an expert educator creating a quiz for interview preparation.

Topic: {topic_title}
Category: {course_category}

Create exactly 5 multiple choice questions with this exact JSON structure:
{{
    "questions": [
        {{
            "question": "<the question text>",
            "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
            "correct": 0,
            "explanation": "<why this answer is correct>"
        }}
    ]
}}

Rules:
- Return ONLY the JSON object
- No extra text before or after
- No markdown formatting
- No code blocks around the JSON
- "correct" is the INDEX (0,1,2,3) of the correct option in the options array
- Make questions practical and relevant to interviews
- Each question must have exactly 4 options
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an expert educator. You create clear, fair and practical quiz questions. You always return valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=1500,
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        lines = raw.split('\n')
        raw = '\n'.join(lines[1:-1])

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"questions": []}