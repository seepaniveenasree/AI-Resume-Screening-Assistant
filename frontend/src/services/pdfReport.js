
import { jsPDF } from "jspdf";
import { scoreLabel, scoreRgb } from "../utils/scoring.js";

const MARGIN = 15;
const LINE = 5.5;

const C = {
  text: [31, 41, 55],
  muted: [107, 114, 128],
  green: [22, 163, 74],
  red: [220, 38, 38],
  blue: [37, 99, 235],
  track: [229, 231, 235],
};

function clean(value) {
  return String(value ?? "").replace(
    /[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022]/g,
    ""
  );
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function safeScore(value) {
  const score = Number(value);
  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, score))
    : 0;
}

export function generateReport(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Analysis results are missing. Analyze a resume first.");
  }

  const scoreBreakdown = safeObject(result.scoreBreakdown);
  const jdSummary = safeObject(result.jdSummary);
  const recommendation = safeObject(result.hiringRecommendation);

  const matchedSkills = safeArray(result.matchedSkills);
  const missingSkills = safeArray(result.missingSkills);
  const interviewQuestions = safeArray(result.interviewQuestions);
  const strengths = safeArray(result.strengths);
  const roleRecommendations = safeArray(result.roleRecommendations);
  const trainingRecommendations = safeArray(result.trainingRecommendations);

  const responsibilities = safeArray(jdSummary.responsibilities);
  const eligibility = safeArray(jdSummary.eligibility);
  const requiredSkills = safeArray(jdSummary.requiredSkills);

  const matchScore = safeScore(result.matchScore);
  const skillsScore = safeScore(scoreBreakdown.skills);
  const experienceScore = safeScore(scoreBreakdown.experience);
  const educationScore = safeScore(scoreBreakdown.education);

  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const contentW = pageW - MARGIN * 2;
    let y = MARGIN;

    const ensureSpace = (needed) => {
      if (y + needed > pageH - MARGIN - 6) {
        doc.addPage();
        y = MARGIN;
      }
    };

    const heading = (title) => {
      ensureSpace(16);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...C.blue);
      doc.text(clean(title), MARGIN, y);
      y += 2;
      doc.setDrawColor(...C.track);
      doc.line(MARGIN, y, pageW - MARGIN, y);
      y += 6;
    };

    const paragraph = (
      text,
      { bold = false, color = C.text, indent = 0, size = 10.5 } = {}
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(
        clean(text),
        contentW - indent
      );

      lines.forEach((line) => {
        ensureSpace(LINE);
        doc.text(line, MARGIN + indent, y);
        y += LINE;
      });
    };

    const bullets = (items) => {
      if (items.length === 0) {
        paragraph("None", { color: C.muted });
        return;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...C.text);

      items.forEach((item) => {
        const lines = doc.splitTextToSize(
          clean(item),
          contentW - 6
        );

        lines.forEach((line, index) => {
          ensureSpace(LINE);
          if (index === 0) {
            doc.text("\u2022", MARGIN + 1, y);
          }
          doc.text(line, MARGIN + 6, y);
          y += LINE;
        });

        y += 1;
      });
    };

    const scoreBar = (label, value) => {
      ensureSpace(8);

      const barX = MARGIN + 32;
      const barW = contentW - 32 - 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...C.text);
      doc.text(label, MARGIN, y);

      doc.setFillColor(...C.track);
      doc.rect(barX, y - 3.5, barW, 4, "F");

      if (value > 0) {
        doc.setFillColor(...scoreRgb(value));
        doc.rect(barX, y - 3.5, (barW * value) / 100, 4, "F");
      }

      doc.text(String(value), barX + barW + 3, y);
      y += 7;
    };

    const coverageBar = (matched, missing) => {
      const total = matched + missing;
      if (total === 0) return;

      ensureSpace(16);

      const matchedW = (contentW * matched) / total;

      doc.setFillColor(...C.green);
      doc.rect(MARGIN, y, matchedW, 5, "F");

      doc.setFillColor(...C.red);
      doc.rect(
        MARGIN + matchedW,
        y,
        contentW - matchedW,
        5,
        "F"
      );

      y += 10;
      paragraph(
        `${matched} of ${total} required skills found in the resume`,
        { color: C.muted, size: 9.5 }
      );
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C.text);
    doc.text("Resume Screening Report", MARGIN, y + 6);
    y += 12;

    paragraph(`Generated on ${new Date().toLocaleDateString()}`, {
      color: C.muted,
      size: 9.5,
    });

    // Score summary
    y += 4;
    ensureSpace(20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(...scoreRgb(matchScore));
    doc.text(`${matchScore}/100`, MARGIN, y + 8);

    doc.setFontSize(12);
    doc.setTextColor(...C.text);
    doc.text(
      `${clean(scoreLabel(matchScore))} - Recommendation: ${
        clean(recommendation.decision || "Consider")
      }`,
      MARGIN + 48,
      y + 7
    );
    y += 16;

    heading("Score Breakdown");
    scoreBar("Skills", skillsScore);
    scoreBar("Experience", experienceScore);
    scoreBar("Education", educationScore);

    paragraph("Weighting: skills 50%, experience 30%, education 20%", {
      color: C.muted,
      size: 9.5,
    });

    heading("Skill Coverage");
    coverageBar(matchedSkills.length, missingSkills.length);

    heading("Job Description Summary");
    paragraph("Responsibilities", { bold: true });
    bullets(responsibilities);

    paragraph("Eligibility", { bold: true });
    bullets(eligibility);

    paragraph("Required skills", { bold: true });
    paragraph(requiredSkills.join(", ") || "None");

    heading("Candidate Strengths");
    bullets(strengths);

    heading("Skills Analysis");
    paragraph("Matched skills", { bold: true, color: C.green });
    paragraph(matchedSkills.join(", ") || "None");

    y += 2;
    paragraph("Missing skills", { bold: true, color: C.red });
    paragraph(missingSkills.join(", ") || "None");

    heading("Recommended Interview Questions");

    if (interviewQuestions.length === 0) {
      paragraph("No interview questions available.", {
        color: C.muted,
      });
    }

    interviewQuestions.forEach((question, index) => {
      const item = safeObject(question);

      paragraph(`${index + 1}. ${item.technology || "General"}`, {
        bold: true,
      });

      paragraph(item.question || "No question text available.", {
        indent: 5,
      });

      y += 1.5;
    });

    heading("Overall Hiring Recommendation");
    paragraph(recommendation.decision || "Consider", { bold: true });
    paragraph(recommendation.reason || "No recommendation details available.");

    heading("Role Recommendations");
    bullets(roleRecommendations);

    heading("Training Recommendations");
    bullets(trainingRecommendations);

    // Footer on every page
    const pages = doc.getNumberOfPages();

    for (let index = 1; index <= pages; index++) {
      doc.setPage(index);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);

      doc.text(
        "AI-generated screening report. It supports, and does not replace, human review.",
        MARGIN,
        pageH - 8
      );

      doc.text(
        `Page ${index} of ${pages}`,
        pageW - MARGIN,
        pageH - 8,
        { align: "right" }
      );
    }

    doc.save("resume-screening-report.pdf");
  } catch (error) {
    console.error("PDF report creation error:", error);
    throw new Error(
      "The PDF could not be created. Check the browser console for details."
    );
  }
}
