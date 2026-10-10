package com.seepani.Resume_screener.model;
import java.util.*;
public record AnalysisResult(
	int matchScore,
    ScoreBreakdown scoreBreakdown,
    JdSummary jdSummary,
    List<String> strengths,
    List<String> matchedSkills,
    List<String> missingSkills,
    List<InterviewQuestion> interviewQuestions,
    HiringRecommendation hiringRecommendation,
    List<String> roleRecommendations,
    List<String> trainingRecommendations
)
{}
