import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "🎯", title: "Match score", text: "A 0 to 100 score built from skills, experience and education, weighted 50, 30 and 20 percent." },
  { icon: "🧩", title: "Skill gap analysis", text: "See which skills from the job description the resume shows, and which are missing." },
  { icon: "💬", title: "Interview questions", text: "Five questions based on the job description and the candidate's own projects and experience." },
  { icon: "🚀", title: "Roles and training", text: "A hiring recommendation, suitable roles, and a training plan to close the gaps." },
];

const STEPS = [
  { title: "Add the resume", text: "Upload a PDF or DOCX file, or paste the resume text." },
  { title: "Add the job description", text: "Paste the responsibilities, eligibility and required skills of the role." },
  { title: "Get the report", text: "Review the scores, charts and insights, then download a structured PDF." },
];

const TECH = ["React", "Spring Boot", "Google Gemini", "Recharts", "jsPDF"];

export default function HomePage() {
  return (
    <main className="home">
      <section className="hero">
        <p className="eyebrow">AI-POWERED CAREER TOOL</p>
        <h1>AI Resume <span>Screening Assistant</span></h1>
        <p className="description">
          Compare your resume with a job description, identify matching
          skills and gaps, and get useful insights to prepare for interviews.
        </p>
        <div className="hero-actions">
          <Link to="/analyze" className="primary-btn">Start Screening</Link>
          <a href="#how-it-works" className="ghost-btn">See how it works</a>
        </div>
      </section>

      <section>
        <h2 className="section-heading">What you get</h2>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works">
        <h2 className="section-heading">How it works</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <article className="step" key={s.title}>
              <div className="step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-heading">Built with</h2>
        <div className="tech-row">
          {TECH.map((t) => (
            <span className="tech-chip" key={t}>{t}</span>
          ))}
        </div>
      </section>

      <p className="home-note">
        The resume text is sent to the Gemini API for analysis and is not
        stored by this app. AI scoring supports a hiring decision and does not
        replace human review.
      </p>
    </main>
  );
}