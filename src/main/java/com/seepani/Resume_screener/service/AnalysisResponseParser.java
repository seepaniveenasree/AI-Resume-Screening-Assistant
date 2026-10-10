package com.seepani.Resume_screener.service;

import java.util.List;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.seepani.Resume_screener.exception.AiServiceException;
import com.seepani.Resume_screener.model.AnalysisResult;
import com.seepani.Resume_screener.model.HiringRecommendation;
import com.seepani.Resume_screener.model.InterviewQuestion;
import com.seepani.Resume_screener.model.JdSummary;
import com.seepani.Resume_screener.model.ScoreBreakdown;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class AnalysisResponseParser {
	 private static final Logger log = LoggerFactory.getLogger(AnalysisResponseParser.class);
	    private static final int QUESTION_COUNT = 5;

	    private final ObjectMapper objectMapper;

	    public AnalysisResponseParser(ObjectMapper objectMapper) {
	        this.objectMapper = objectMapper;
	    }

	    public AnalysisResult parse(String raw) {
	        String json = extractJson(raw);
	        AnalysisResult parsed;
	        try {
	            parsed = objectMapper.readValue(json, AnalysisResult.class);
	        } catch (JacksonException e) {
	            throw new AiServiceException(
	                    "The AI returned an unreadable response. Please try again.", e);
	        }
	        return normalize(parsed);
	    }

	    private String extractJson(String raw) {
	        String s = raw == null ? "" : raw.trim();
	        if (s.startsWith("```")) {
	            s = s.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
	        }
	        int start = s.indexOf('{');
	        int end = s.lastIndexOf('}');
	        if (start >= 0 && end > start) {
	            s = s.substring(start, end + 1);
	        }
	        return s;
	    }

	    private AnalysisResult normalize(AnalysisResult r) {
	        if (r == null || r.scoreBreakdown() == null) {
	            throw new AiServiceException("The AI response was missing the score details. Please try again.");
	        }

	        int skills = clamp(r.scoreBreakdown().skills());
	        int experience = clamp(r.scoreBreakdown().experience());
	        int education = clamp(r.scoreBreakdown().education());
	        int total = (int) Math.round(skills * 0.5 + experience * 0.3 + education * 0.2);

	        List<InterviewQuestion> questions = safe(r.interviewQuestions());
	        if (questions.size() != QUESTION_COUNT) {
	            log.warn("AI returned {} interview questions, expected {}", questions.size(), QUESTION_COUNT);
	        }
	        if (questions.size() > QUESTION_COUNT) {
	            questions = questions.subList(0, QUESTION_COUNT);
	        }

	        JdSummary jd = r.jdSummary() == null
	                ? new JdSummary(List.of(), List.of(), List.of())
	                : new JdSummary(safe(r.jdSummary().responsibilities()),
	                                safe(r.jdSummary().eligibility()),
	                                safe(r.jdSummary().requiredSkills()));

	        HiringRecommendation rec = r.hiringRecommendation() == null
	                ? new HiringRecommendation("Consider", "")
	                : new HiringRecommendation(normalizeDecision(r.hiringRecommendation().decision()),
	                                           r.hiringRecommendation().reason());

	        return new AnalysisResult(
	                total,
	                new ScoreBreakdown(skills, experience, education),
	                jd,
	                safe(r.strengths()),
	                safe(r.matchedSkills()),
	                safe(r.missingSkills()),
	                questions,
	                rec,
	                safe(r.roleRecommendations()),
	                safe(r.trainingRecommendations()));
	    }

	    private int clamp(int value) {
	        return Math.max(0, Math.min(100, value));
	    }

	    private <T> List<T> safe(List<T> list) {
	        return list == null ? List.of() : list;
	    }

	    private String normalizeDecision(String decision) {
	        if (decision == null) return "Consider";
	        String d = decision.trim().toLowerCase();
	        if (d.startsWith("hire")) return "Hire";
	        if (d.startsWith("reject")) return "Reject";
	        return "Consider";
	    }
}
