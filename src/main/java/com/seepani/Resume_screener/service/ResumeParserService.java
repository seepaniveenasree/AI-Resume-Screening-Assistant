package com.seepani.Resume_screener.service;

import java.io.IOException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.seepani.Resume_screener.exception.InvalidInputException;

@Service
public class ResumeParserService {
	private static final int MIN_TEXT_LENGTH = 100;
    public String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename() == null
                ? "" : file.getOriginalFilename().toLowerCase();
        try {
            String text;
            if (filename.endsWith(".pdf")) {
                text = parsePdf(file);
            } else if (filename.endsWith(".docx")) {
                text = parseDocx(file);
            } else {
                throw new InvalidInputException("Unsupported file type. Please upload a PDF or DOCX file.");
            }

            text = clean(text);
            System.out.println("Uploaded file: " + filename);
            System.out.println("Extracted resume text length: " + text.length());

            if (text.length() < MIN_TEXT_LENGTH) {
                throw new InvalidInputException(
                    "Could not extract readable text from this file. "
                    + "If it is a scanned PDF, please paste the resume text instead.");
            }
            return text;

        } catch (IOException e) {
            throw new InvalidInputException("The file could not be read. It may be corrupted or password-protected.");
        }
    }
    private String parsePdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        }
    }

    private String parseDocx(MultipartFile file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String clean(String text) {
        if (text == null) return "";
        return text.replaceAll("[ \\t]+", " ")      
                   .replaceAll("\\n{3,}", "\n\n")   
                   .trim();
    }
}
