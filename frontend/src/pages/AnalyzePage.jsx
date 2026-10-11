
import { useState } from "react";
import { analyzeResume } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
export default function AnalyzePage({ onResult }) {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Validate the job description
    if (jobDescription.trim().length < 50) {
      setError("Job description must contain at least 50 characters.");
      return;
    }

    // Validate the selected resume
    if (mode === "upload") {
      if (!file) {
        setError("Please choose a resume file.");
        return;
      }

      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
        setError("Only PDF and DOCX files are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Resume file must be 5 MB or smaller.");
        return;
      }
    } else {
      if (!resumeText.trim()) {
        setError("Please paste your resume text.");
        return;
      }
    }

    setLoading(true);

    try {
      const result = await analyzeResume({
        resumeFile: mode === "upload" ? file : null,
        resumeText: mode === "paste" ? resumeText.trim() : "",
        jobDescription: jobDescription.trim(),
      });

      onResult(result);
      navigate("/results");
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page analyze-page">
	<Link to="/" className="back-link">
	  &larr; Back to home
	</Link>
      <h1>Analyze Your Resume</h1>
      <p className="description">
        Upload your resume or paste its text, then add the job description.
      </p>

      <form onSubmit={handleSubmit} className="card form-card">
        <div className="mode-toggle">
          <button
            type="button"
            className={mode === "upload" ? "mode-btn active" : "mode-btn"}
            onClick={() => {
              setMode("upload");
              setError("");
            }}
          >
            Upload Resume
          </button>

          <button
            type="button"
            className={mode === "paste" ? "mode-btn active" : "mode-btn"}
            onClick={() => {
              setMode("paste");
              setError("");
            }}
          >
            Paste Resume Text
          </button>
        </div>

        {mode === "upload" && (
          <div className="form-group">
            <label htmlFor="resumeFile">Choose Resume (PDF or DOCX)</label>
            <input
              id="resumeFile"
              type="file"
              accept=".pdf,.docx"
              onChange={(event) =>
                setFile(event.target.files[0] || null)
              }
            />

            {file && <p className="file-name">Selected file: {file.name}</p>}
            <small>Maximum file size: 5 MB.</small>
          </div>
        )}

        {mode === "paste" && (
          <div className="form-group">
            <label htmlFor="resumeText">Paste Your Resume</label>
            <textarea
              id="resumeText"
              rows="8"
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="jobDescription">Job Description</label>
          <textarea
            id="jobDescription"
            rows="8"
            placeholder="Paste the job description here (at least 50 characters)..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <small>{jobDescription.trim().length} characters (minimum 50).</small>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary-btn submit-btn">
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>
    </main>
  );
}
