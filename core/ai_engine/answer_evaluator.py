import json
from groq import Groq
from decouple import config

client = Groq(api_key=config('GROQ_API_KEY'))


def evaluate_answer(question, answer, interview_type):

    # check for very short or empty answers before calling AI
    if not answer or len(answer.strip()) < 10:
        return {
            "score": 1,
            "good": "No substantial answer was provided.",
            "improve": "Please provide a detailed and thoughtful answer to the question.",
            "ideal_answer": "A strong answer should be detailed with specific examples and clear reasoning."
        }

    # pick the right evaluator based on interview type
    if interview_type == 'dsa':
        return evaluate_dsa(question, answer)
    elif interview_type == 'hr':
        return evaluate_hr(question, answer)
    elif interview_type == 'system_design':
        return evaluate_system_design(question, answer)
    elif interview_type == 'domain':
        return evaluate_domain(question, answer)
    else:
        return evaluate_hr(question, answer)


# ── DSA Evaluator ──
def evaluate_dsa(question, answer):
    prompt = f"""
You are a strict senior software engineer evaluating a DSA/coding interview answer.

Question: {question}
Candidate's Answer: {answer}

The candidate may have written:
- Actual code (Python, Java, C++, JavaScript etc.)
- Pseudocode
- An explanation of the algorithm/approach
- A mix of code and explanation

EVALUATION RULES:
- If the candidate wrote CODE → evaluate correctness, logic, time complexity, space complexity, edge cases
- If the candidate wrote PSEUDOCODE → evaluate if the logic is correct and would work
- If the candidate wrote only EXPLANATION → evaluate if the approach is correct and optimal
- A correct working solution with good complexity = score 8-10
- A correct solution with poor complexity = score 6-7
- A partially correct solution = score 4-5
- A wrong approach or wrong code = score 2-3
- A completely irrelevant answer or single word = score 1

STRICT SCORING RULES:
- Score 9-10: Correct code + optimal complexity + handles edge cases
- Score 7-8: Correct code/approach + acceptable complexity
- Score 5-6: Partially correct, right idea but bugs or wrong complexity
- Score 3-4: Wrong approach but shows some understanding
- Score 1-2: Completely wrong, irrelevant, or too short to evaluate

Return ONLY a valid JSON object:
{{
    "score": <integer from 1 to 10>,
    "good": "<what was technically correct about the solution>",
    "improve": "<specific technical improvements — bugs, better algorithm, complexity>",
    "ideal_answer": "<a correct efficient solution with brief explanation>"
}}

Return ONLY the JSON. No extra text. No markdown. No code blocks around the JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a strict senior software engineer. You evaluate DSA solutions technically. You check code correctness, time complexity, space complexity and edge cases. You never give high scores for wrong or incomplete solutions."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=700,
        temperature=0.1,
    )

    return parse_response(response)


# ── HR Evaluator ──
def evaluate_hr(question, answer):

    if len(answer.strip()) < 20:
        return {
            "score": 1,
            "good": "No substantial answer was provided.",
            "improve": "Please provide a detailed answer with real examples from your experience.",
            "ideal_answer": "A strong HR answer follows the STAR format — Situation, Task, Action, Result."
        }

    prompt = f"""
You are a strict and experienced HR interviewer evaluating a behavioral interview answer.

Question: {question}
Candidate's Answer: {answer}

EVALUATION CRITERIA:
- Does the answer follow STAR format? (Situation, Task, Action, Result)
- Are there specific real examples mentioned?
- Is the answer relevant to the question?
- Is the answer detailed enough (at least 3-4 sentences)?
- Does it show soft skills like leadership, teamwork, communication?

STRICT SCORING RULES:
- Score 9-10: Perfect STAR format, specific examples, very detailed, highly relevant
- Score 7-8: Good answer, relevant, has examples but missing some STAR elements
- Score 5-6: Average answer, somewhat relevant, lacks specific examples
- Score 3-4: Weak answer, vague, no real examples, too short
- Score 1-2: Single word/character, irrelevant, or completely off topic

Return ONLY a valid JSON object:
{{
    "score": <integer from 1 to 10>,
    "good": "<what was good about the answer>",
    "improve": "<specific advice to improve — mention STAR format if missing>",
    "ideal_answer": "<a sample strong answer using STAR format>"
}}

Return ONLY the JSON. No extra text. No markdown. No code blocks around the JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a strict HR interviewer. You evaluate answers based on STAR format, relevance, specificity and depth. You never give high scores for vague or short answers."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=600,
        temperature=0.1,
    )

    return parse_response(response)


# ── System Design Evaluator ──
def evaluate_system_design(question, answer):

    if len(answer.strip()) < 20:
        return {
            "score": 1,
            "good": "No substantial answer was provided.",
            "improve": "Discuss components, scalability, database choices and tradeoffs.",
            "ideal_answer": "A strong system design answer covers components, data flow, scalability and tradeoffs."
        }

    prompt = f"""
You are a strict senior software architect evaluating a system design interview answer.

Question: {question}
Candidate's Answer: {answer}

EVALUATION CRITERIA:
- Are the main components/services identified?
- Is the data flow explained?
- Are database choices mentioned and justified?
- Is scalability discussed?
- Are tradeoffs mentioned?
- Is the answer relevant and detailed?

STRICT SCORING RULES:
- Score 9-10: All components, data flow, DB choices, scalability, tradeoffs covered
- Score 7-8: Most components covered, good understanding shown
- Score 5-6: Basic components mentioned but missing depth
- Score 3-4: Very high level, missing most key elements
- Score 1-2: Irrelevant, too short, or completely wrong

Return ONLY a valid JSON object:
{{
    "score": <integer from 1 to 10>,
    "good": "<what system design concepts were correctly identified>",
    "improve": "<what components or concepts are missing>",
    "ideal_answer": "<a sample strong system design answer covering all key areas>"
}}

Return ONLY the JSON. No extra text. No markdown. No code blocks around the JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a strict senior software architect. You evaluate system design answers on components, scalability, databases and tradeoffs. You never give high scores for incomplete answers."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=600,
        temperature=0.1,
    )

    return parse_response(response)


# ── Domain Specific Evaluator ──
def evaluate_domain(question, answer):

    if len(answer.strip()) < 20:
        return {
            "score": 1,
            "good": "No substantial answer was provided.",
            "improve": "Provide a detailed answer showing your domain knowledge.",
            "ideal_answer": "A strong domain answer shows deep knowledge with real examples."
        }

    prompt = f"""
You are a strict domain expert evaluating a domain-specific interview answer.

Question: {question}
Candidate's Answer: {answer}

EVALUATION CRITERIA:
- Is the answer technically accurate for the domain?
- Does it show real domain knowledge?
- Are specific terms, concepts or examples used correctly?
- Is the answer relevant and detailed enough?

STRICT SCORING RULES:
- Score 9-10: Deep domain knowledge, accurate, specific examples, very detailed
- Score 7-8: Good domain knowledge, mostly accurate, relevant
- Score 5-6: Basic knowledge shown, somewhat accurate but lacks depth
- Score 3-4: Vague, shows little domain knowledge
- Score 1-2: Wrong, irrelevant, too short

Return ONLY a valid JSON object:
{{
    "score": <integer from 1 to 10>,
    "good": "<what domain knowledge was correctly shown>",
    "improve": "<what domain concepts are missing or incorrect>",
    "ideal_answer": "<a sample strong domain-specific answer>"
}}

Return ONLY the JSON. No extra text. No markdown. No code blocks around the JSON.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a strict domain expert. You evaluate answers based on domain accuracy, depth and relevance. You never give high scores for vague or shallow answers."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=600,
        temperature=0.1,
    )

    return parse_response(response)


# ── shared response parser ──
def parse_response(response):
    raw = response.choices[0].message.content.strip()

    # clean up if model wraps in ```json ... ```
    if raw.startswith("```"):
        lines = raw.split('\n')
        raw = '\n'.join(lines[1:-1])

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 5,
            "good": "Your answer was received.",
            "improve": "Try to be more specific and structured in your answer.",
            "ideal_answer": "A strong answer would be clear, specific and well structured."
        }