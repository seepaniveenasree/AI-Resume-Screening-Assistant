package com.seepani.Resume_screener.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import com.seepani.Resume_screener.exception.AiServiceException;
import com.seepani.Resume_screener.model.AnalysisResult;
import tools.jackson.databind.ObjectMapper;

class AnalysisResponseParserTest {

    private final AnalysisResponseParser parser =
            new AnalysisResponseParser(new ObjectMapper());

    private static final String VALID = """
        {
          "matchScore": 999,
          "scoreBreakdown": {
            "skills": 80,
            "experience": 70,
            "education": 90
          },
          "jdSummary": {
            "responsibilities": [],
            "eligibility": [],
            "requiredSkills": ["Java"]
          },
          "strengths": ["a"],
          "matchedSkills": ["Java"],
          "missingSkills": [],
          "interviewQuestions": [],
          "hiringRecommendation": {
            "decision": "Strong Hire",
            "reason": "ok"
          },
          "roleRecommendations": [],
          "trainingRecommendations": []
        }
        """;

    @Test
    void recomputesScoreFromBreakdown() {
        // 80*0.5 + 70*0.3 + 90*0.2 = 79
        assertEquals(79, parser.parse(VALID).matchScore());
    }

    @Test
    void stripsMarkdownFences() {
        String fenced = "```json\n" + VALID + "\n```";

        assertEquals(79, parser.parse(fenced).matchScore());
    }

    @Test
    void normalizesDecision() {
        // "Strong Hire" currently becomes "Consider" in the parser.
        assertEquals(
                "Consider",
                parser.parse(VALID).hiringRecommendation().decision());
    }

    @Test
    void throwsOnInvalidJson() {
        assertThrows(
                AiServiceException.class,
                () -> parser.parse("this is not json"));
    }

    @Test
    void clampsScoresAbove100() {
        String input = VALID.replace(
                "\"skills\": 80",
                "\"skills\": 140");

        AnalysisResult result = parser.parse(input);

        assertEquals(100, result.scoreBreakdown().skills());

        // 100*0.5 + 70*0.3 + 90*0.2 = 89
        assertEquals(89, result.matchScore());
    }
}