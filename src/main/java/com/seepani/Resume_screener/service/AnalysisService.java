package com.seepani.Resume_screener.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.seepani.Resume_screener.exception.AiServiceException;
import com.seepani.Resume_screener.exception.InvalidInputException;
import com.seepani.Resume_screener.model.AnalysisResult;

@Service
public class AnalysisService {
	private static final Logger log =
            LoggerFactory.getLogger(AnalysisService.class);

    private final ResumeParserService resumeParserService;
    private final GeminiClient geminiClient;
    private final PromptBuilder promptBuilder;
    private final AnalysisResponseParser responseParser;

    public AnalysisService(
    		ResumeParserService resumeParserService,
            GeminiClient geminiClient,
            PromptBuilder promptBuilder,
            AnalysisResponseParser responseParser) {

        this.resumeParserService = resumeParserService;
        this.geminiClient = geminiClient;
        this.promptBuilder = promptBuilder;
        this.responseParser = responseParser;
    }
    public AnalysisResult analyze(
    		MultipartFile resumeFile,
            String resumeText,
            String jobDescription) {

    	validate(resumeFile, resumeText, jobDescription);

    	String resume = resolveResumeText(resumeFile, resumeText);

    	String system = promptBuilder.buildSystemPrompt();
    	String user = promptBuilder.buildUserPrompt(resume, jobDescription);

    	String raw = geminiClient.generate(system, user);

    	try {
    	    return responseParser.parse(raw);
    	} catch (AiServiceException e) {
    	    log.warn("AI response was unreadable. Retrying once.");

    	    String retryRaw = geminiClient.generate(system, user);
    	    return responseParser.parse(retryRaw);
    	}
    }
    private void validate(
            MultipartFile resumeFile,
            String resumeText,
            String jobDescription) {

        boolean hasFile =
                resumeFile != null && !resumeFile.isEmpty();

        boolean hasText =
                resumeText != null && !resumeText.isBlank();

        if (!hasFile && !hasText) {
            throw new InvalidInputException(
                    "Please upload a resume file or paste your resume text."
            );
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            throw new InvalidInputException(
                    "Job description is required."
            );
        }

        if (jobDescription.length() < 50) {
            throw new InvalidInputException(
                    "Job description is too short to analyze. Please add more detail."
            );
        }

        if (jobDescription.length() > 10000) {
            throw new InvalidInputException(
                    "Job description is too long (max 10,000 characters)."
            );
        }
    }

    private String resolveResumeText(
            MultipartFile resumeFile,
            String resumeText) {

        String text = (resumeFile != null && !resumeFile.isEmpty())
                ? resumeParserService.extractText(resumeFile)
                : resumeText.trim();

        return text.length() > 15000
                ? text.substring(0, 15000)
                : text;
    }
}
