package com.seepani.Resume_screener.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.seepani.Resume_screener.model.AnalysisResult;
import com.seepani.Resume_screener.service.AnalysisService;
@RestController
@RequestMapping("/api")

public class AnalyzeController {

	private final AnalysisService analysisService;

    public AnalyzeController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnalysisResult analyze(
            @RequestParam(required = false) MultipartFile resumeFile,
            @RequestParam(required = false) String resumeText,
            @RequestParam(required = false) String jobDescription) {
        return analysisService.analyze(resumeFile, resumeText, jobDescription);
    }
}
