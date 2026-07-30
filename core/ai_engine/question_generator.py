from groq import Groq
from decouple import config

client = Groq(api_key=config('GROQ_API_KEY'))

PROMPTS = {
    'hr': """You are an experienced HR interviewer.
Generate 5 behavioral interview questions for a {role} role.
Difficulty level: {difficulty}
- Easy: Simple, common questions suitable for freshers
- Medium: Moderate questions requiring some experience
- Hard: Complex questions requiring deep experience and leadership
Return only a numbered list, one question per line.""",

    'dsa': """You are a technical interviewer at a top tech company.
Generate 5 DSA and coding interview questions for a {role} role.
Difficulty level: {difficulty}
- Easy: Basic data structures, simple algorithms (arrays, strings, basic sorting)
- Medium: Trees, graphs, dynamic programming, intermediate algorithms
- Hard: Complex graph problems, advanced DP, system-level optimizations
Return only a numbered list, one question per line.""",

    'system_design': """You are a senior software architect.
Generate 5 system design interview questions for a {role} role.
Difficulty level: {difficulty}
- Easy: Simple systems like URL shortener, basic REST APIs
- Medium: Scalable systems like Twitter feed, ride sharing
- Hard: Complex distributed systems like YouTube, Google Maps
Return only a numbered list, one question per line.""",

    'domain': """You are a domain expert interviewer.
Generate 5 domain specific interview questions for a {role} role.
Difficulty level: {difficulty}
- Easy: Basic domain concepts and fundamentals
- Medium: Practical application of domain knowledge
- Hard: Advanced domain expertise and strategic thinking
Return only a numbered list, one question per line.""",
}


def generate_questions(interview_type, target_role='Software Engineer', difficulty='medium'):
    prompt = PROMPTS.get(interview_type, PROMPTS['hr'])
    prompt = prompt.format(role=target_role, difficulty=difficulty)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.7,
    )

    raw = response.choices[0].message.content

    questions = []
    for line in raw.strip().split('\n'):
        line = line.strip()
        if line and line[0].isdigit():
            if '.' in line:
                question = line.split('.', 1)[-1].strip()
            elif ')' in line:
                question = line.split(')', 1)[-1].strip()
            else:
                question = line
            if question:
                questions.append(question)

    return questions