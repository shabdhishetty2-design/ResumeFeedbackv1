function uploadResume() {
  const fileInput = document.getElementById('resumeFile');
  const feedbackEl = document.getElementById('feedback');

  if (!fileInput.files.length) {
    alert('Please upload a PDF resume.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  feedbackEl.textContent = 'Processing...';

  fetch('http://localhost:5000/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.feedback) {
      feedbackEl.textContent = data.feedback;
    } else {
      feedbackEl.textContent = 'Error: ' + data.error;
    }
  })
  .catch(err => {
    feedbackEl.textContent = 'Error: ' + err.message;
  });
}
function compareResumeToJob() {
  const resumeInput = document.getElementById('resumeFile');
  const jobInput = document.getElementById('jobFile');
  const feedbackEl = document.getElementById('feedback');

  if (!resumeInput.files.length || !jobInput.files.length) {
    alert('Please upload both resume and job description.');
    return;
  }

  const formData = new FormData();
  formData.append('resume', resumeInput.files[0]);
  formData.append('job', jobInput.files[0]);

  feedbackEl.textContent = 'Analyzing resume against job description...';

  fetch('http://localhost:5000/compare', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.feedback) {
      feedbackEl.textContent = data.feedback;
    } else {
      feedbackEl.textContent = 'Error: ' + data.error;
    }
  })
  .catch(err => {
    feedbackEl.textContent = 'Error: ' + err.message;
  });
}
function compareResumeToJob() {
  const resumeInput = document.getElementById('resumeFile');
  const jobInput = document.getElementById('jobFile');
  const feedbackEl = document.getElementById('feedback');
  const scoreEl = document.getElementById('matchScore');
  const missingEl = document.getElementById('missingKeywords');

  if (!resumeInput.files.length || !jobInput.files.length) {
    alert('Please upload both resume and job description.');
    return;
  }

  const formData = new FormData();
  formData.append('resume', resumeInput.files[0]);
  formData.append('job', jobInput.files[0]);

  feedbackEl.textContent = 'Analyzing resume against job description...';
  scoreEl.textContent = '-';
  missingEl.textContent = '-';

  fetch('http://localhost:5000/compare', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.feedback) {
      feedbackEl.textContent = data.feedback;
      scoreEl.textContent = data.score;
      missingEl.textContent = data.missing_keywords.join(', ') || 'None 🎉';
    } else {
      feedbackEl.textContent = 'Error: ' + data.error;
    }
  })
  .catch(err => {
    feedbackEl.textContent = 'Error: ' + err.message;
  });
}
function compareResumeToJob() {
  const resumeInput = document.getElementById('resumeFile');
  const jobInput = document.getElementById('jobFile');
  const feedbackEl = document.getElementById('feedback');
  const scoreEl = document.getElementById('matchScore');
  const missingEl = document.getElementById('missingKeywords');
  const progressFill = document.getElementById('progressFill');

  if (!resumeInput.files.length || !jobInput.files.length) {
    alert('Please upload both resume and job description.');
    return;
  }

  const formData = new FormData();
  formData.append('resume', resumeInput.files[0]);
  formData.append('job', jobInput.files[0]);

  feedbackEl.textContent = 'Analyzing resume against job description...';
  scoreEl.textContent = '-';
  missingEl.textContent = '-';
  progressFill.style.width = '0%';
  progressFill.style.backgroundColor = '#28a745';

  fetch('http://localhost:5000/compare', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.feedback) {
      const score = data.score;
      feedbackEl.textContent = data.feedback;
      scoreEl.textContent = score;
      missingEl.textContent = data.missing_keywords.join(', ') || 'None 🎉';

      // Update progress bar
      progressFill.style.width = score + '%';
      progressFill.textContent = score + '%';

      // Change color based on score
      if (score >= 80) {
        progressFill.style.backgroundColor = '#28a745'; // green
      } else if (score >= 50) {
        progressFill.style.backgroundColor = '#ffc107'; // yellow
      } else {
        progressFill.style.backgroundColor = '#dc3545'; // red
      }

    } else {
      feedbackEl.textContent = 'Error: ' + data.error;
    }
  })
  .catch(err => {
    feedbackEl.textContent = 'Error: ' + err.message;
  });
}
let chart; // global chart

function renderMissingChart(missingSkills) {
  const ctx = document.getElementById('missingChart').getContext('2d');

  if (chart) chart.destroy(); // clear previous chart

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: missingSkills,
      datasets: [{
        label: 'Missing Skills',
        data: missingSkills.map(() => 1), // same height
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const score = document.getElementById('matchScore').textContent;
  const missing = document.getElementById('missingKeywords').textContent;
  const feedback = document.getElementById('feedback').textContent;

  let y = 10;
  doc.setFontSize(14);
  doc.text("AI Resume Feedback Report", 10, y); y += 10;

  doc.setFontSize(12);
  doc.text("Match Score: " + score + "%", 10, y); y += 10;
  doc.text("Missing Keywords: " + missing, 10, y); y += 10;

  const splitFeedback = doc.splitTextToSize(feedback, 180);
  doc.text(splitFeedback, 10, y + 10);

  doc.save("resume_feedback.pdf");
}


