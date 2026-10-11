
import { useState } from "react";
import { Link } from "react-router-dom";

import Section from "../components/Section.jsx";
import ScoreGauge from "../components/ScoreGauge.jsx";
import ScoreBreakdownChart from "../components/ScoreBreakdownChart.jsx";
import SkillCoverageChart from "../components/SkillCoverageChart.jsx";
import SkillTags from "../components/SkillTags.jsx";
import HighlightedText from "../components/HighlightedText.jsx";

import { scoreLabel } from "../utils/scoring.js";

export default function ResultsPage({ result }) {
  const [pdfError, setPdfError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setPdfError("");
    setIsDownloading(true);

    try {

      const { generateReport } = await import(
        "../services/pdfReport.js"
      );

      generateReport(result);
    } catch (error) {
      console.error("PDF generation failed:", error);

      setPdfError("Could not generate the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  const matchedSkills = new Set(
    (result.matchedSkills || []).map((skill) =>
      String(skill).toLowerCase()
    )
  );

  const decision = (
    result.hiringRecommendation?.decision || "Consider"
  ).toLowerCase();

  return (
    <main className="page results-page">
      <header className="results-header">
        <div>
          <p className="eyebrow">AI RESUME SCREENING</p>
          <h1>Resume Analysis Results</h1>
          <p className="description">
            See how your resume matches the job description.
          </p>
        </div>

        <div className="header-actions">
		<Link to="/analyze" className="ghost-btn">
		  Analyze Another Resume
		</Link>

          <button
            type="button"
            onClick={handleDownload}
            className="primary-btn"
            disabled={isDownloading}
          >
            {isDownloading ? "Generating PDF..." : "Download PDF report"}
          </button>

          {pdfError && (
            <p className="error" role="alert">
              {pdfError}
            </p>
          )}
        </div>
      </header>
	  

      {/* Overall match and charts */}
      <Section title="Overall Match">
	  <div className="summary-row">
	    <span className={`badge badge-${decision}`}>
	      {result.hiringRecommendation?.decision || "Consider"}
	    </span>
	    <span className="muted">
	      {scoreLabel(result.matchScore ?? 0)}
	    </span>
	  </div>
        <section className="charts">
          <div className="chart-card">
            <h3>Match score</h3>
            <ScoreGauge score={result.matchScore ?? 0} />
            <p className="muted">
              {scoreLabel(result.matchScore ?? 0)}
            </p>
            <p className="muted">Overall match score</p>
          </div>

          <div className="chart-card">
            <h3>Score breakdown</h3>
            <ScoreBreakdownChart
              breakdown={{
                skills: result.scoreBreakdown?.skills ?? 0,
                experience: result.scoreBreakdown?.experience ?? 0,
                education: result.scoreBreakdown?.education ?? 0,
              }}
            />
          </div>

          <div className="chart-card">
            <h3>Skill coverage</h3>
            <SkillCoverageChart
              matched={result.matchedSkills || []}
              missing={result.missingSkills || []}
            />
            <p className="muted">
              Share of identified skills found in the resume.
            </p>
          </div>
        </section>
      </Section>

      {/* Job description summary */}
      <Section title="Job Description Summary">
        <h3>Key Responsibilities</h3>
        <ul>
          {(result.jdSummary?.responsibilities || []).map(
            (item, index) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>

        <h3>Eligibility</h3>
        <ul>
          {(result.jdSummary?.eligibility || []).map(
            (item, index) => (
              <li key={index}>{item}</li>
            )
          )}
        </ul>

        <h3>Required Skills</h3>
        <ul className="tags">
          {(result.jdSummary?.requiredSkills || []).map((skill) => (
            <li
              key={skill}
              className={`tag ${
                matchedSkills.has(String(skill).toLowerCase())
                  ? "tag-matched"
                  : "tag-missing"
              }`}
            >
              {skill}
            </li>
          ))}
        </ul>
      </Section>

      {/* Candidate strengths */}
      <Section title="Candidate Strengths">
        <ul className="strength-list">
          {(result.strengths || []).map((strength, index) => (
            <li key={index}>
              <HighlightedText
                text={strength}
                skills={result.matchedSkills || []}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* Skills comparison */}
      <Section title="Skills Comparison">
        <h3>Matched Skills</h3>
        <SkillTags
          skills={result.matchedSkills || []}
          variant="matched"
        />

        <h3>Missing Skills</h3>
        {(result.missingSkills || []).length > 0 ? (
          <SkillTags
            skills={result.missingSkills}
            variant="missing"
          />
        ) : (
          <p className="muted">
            None — all identified skills matched!
          </p>
        )}
      </Section>

      {/* Interview questions */}
      <Section title="Interview Questions">
        <ol className="question-list">
          {(result.interviewQuestions || []).map((item, index) => (
            <li key={index}>
              <span className="technology-label">
                {item.technology}
              </span>
              <p>{item.question}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Hiring recommendation */}
      <Section title="Hiring Recommendation">
        <span className={`badge badge-${decision}`}>
          {result.hiringRecommendation?.decision || "Consider"}
        </span>
        <p>
          {result.hiringRecommendation?.reason ||
            "No recommendation details available."}
        </p>
      </Section>

      {/* Recommended roles */}
      <Section title="Recommended Roles">
	  <ul className="tags">
	    {(result.roleRecommendations || []).map((role, index) => (
	      <li key={index} className="tag tag-role">
	        {role}
	      </li>
	    ))}
	  </ul>
      </Section>

      {/* Training recommendations */}
      <Section title="Training Recommendations">
	  <ol className="step-list">
	    {(result.trainingRecommendations || []).map((item, index) => (
	      <li key={index}>{item}</li>
	    ))}
	  </ol>
      </Section>
    </main>
  );
}
