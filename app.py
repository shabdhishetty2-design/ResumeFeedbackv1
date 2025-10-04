from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import openai
from flask_cors import CORS
import re

openai.api_key = "your-openai-api-key"

app = Flask(__name__)
CORS(app)

# === UTILITY FUNCTIONS ===

def extract_text(file):
    if file.filename.endswith('.pdf'):
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    elif file.filename.endswith('.txt'):
        return file.read().decode("utf-8")
    else:
        raise ValueError("Unsupported file type. Upload PDF or TXT.")

def extract_keywords(text):
    # Simple keyword extractor (can be improved with spaCy or keyword libraries)
    words = re.findall(r'\b[A-Za-z][A-Za-z]+\b', text.lower())
    ignore = {"and", "the", "with", "from", "that", "have", "this", "which", "using", "also", "such", "for", "are"}
    keywords = [word for word in words if word not in ignore and len(word) > 2]
    return set(keywords)

def calculate_match(resume_keywords, job_keywords):
    matches = resume_keywords & job_keywords
    missing = job_keywords - resume_keywords
    match_score = round(len(matches) / len(job_keywords) * 100, 2) if job_keywords else 0
    return match_score, list(matches), list(missing)

def generate_feedback(resume_text, job_text, score, missing_keywords):
    prompt = f"""
You are a career expert. The candidate submitted a resume for a job. The resume was matched against the job description.

Match Score: {score}%

Missing Keywords: {", ".join(missing_keywords)}

Now provide detailed feedback:
- How well does the resume match?
- What key skills or sections are missing?
- What improvements should the candidate make to better fit the job?

Resume:
{resume_text}

Job Description:
{job_text}
"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800,
        temperature=0.7
    )
    return response.choices[0].message.content

# === API ENDPOINT ===

@app.route('/compare', methods=['POST'])
def compare_resume_to_job():
    if 'resume' not in request.files or 'job' not in request.files:
        return jsonify({'error': 'Both resume and job description are required'}), 400

    resume_file = request.files['resume']
    job_file = request.files['job']

    try:
        resume_text = extract_text(resume_file)
        job_text = extract_text(job_file)

        resume_keywords = extract_keywords(resume_text)
        job_keywords = extract_keywords(job_text)

        score, matched, missing = calculate_match(resume_keywords, job_keywords)
        ai_feedback = generate_feedback(resume_text, job_text, score, missing)

        return jsonify({
            'score': score,
            'missing_keywords': missing,
            'matched_keywords': matched,
            'feedback': ai_feedback
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
