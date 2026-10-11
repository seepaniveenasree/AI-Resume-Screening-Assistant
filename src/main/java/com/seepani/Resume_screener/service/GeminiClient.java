package com.seepani.Resume_screener.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.seepani.Resume_screener.exception.AiServiceException;

import tools.jackson.databind.JsonNode;

@Service
public class GeminiClient {
	private final RestClient restClient;
    private final String model;
    private final String apiKey;
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final int MAX_ATTEMPTS = 2;
    private static final long RETRY_DELAY_MS = 2000;
    public GeminiClient(RestClient geminiRestClient,
                        @Value("${gemini.model}") String model,
                        @Value("${gemini.api-key}") String apiKey) {
        this.restClient = geminiRestClient;
        this.model = model;
        this.apiKey = apiKey;
        log.info("Gemini key starts with AQ.: {}", apiKey != null && apiKey.startsWith("AQ."));
        log.info("Gemini key length: {}", apiKey == null ? 0 : apiKey.length());
    }
    public String generate(String systemPrompt, String userPrompt) {
        Map<String, Object> body = Map.of(
            "systemInstruction",
            Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents",
            List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt))
            )),
            "generationConfig",
            Map.of(
                "temperature", 0.2,
                "responseMimeType", "application/json"
            )
        );

        for (int attempt = 1; ; attempt++) {
            try {
                return callGemini(body);

            } catch (RestClientResponseException e) {
                int code = e.getStatusCode().value();

                if (isRetryable(code) && attempt < MAX_ATTEMPTS) {
                    log.warn("Gemini returned HTTP {}. Retrying attempt {}.",
                            code, attempt);
                    pause();
                    continue;
                }

                throw translate(e);

            } catch (ResourceAccessException e) {
                if (attempt < MAX_ATTEMPTS) {
                    log.warn("Gemini connection failed. Retrying attempt {}.",
                            attempt);
                    pause();
                    continue;
                }

                throw new AiServiceException(
                    HttpStatus.GATEWAY_TIMEOUT,
                    "The AI service could not be reached or took too long. Please try again.",
                    e
                );
            }
        }
    }
    
  private String callGemini(Map<String, Object> body) {
    JsonNode response = restClient.post()
        .uri("/models/{model}:generateContent", model)
        .header("x-goog-api-key", apiKey)
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .retrieve()
        .body(JsonNode.class);

    String text = response == null ? "" : response
        .path("candidates").path(0)
        .path("content").path("parts").path(0)
        .path("text").asText("");

    if (text.isBlank()) {
        throw new AiServiceException(
            "The AI returned an empty response. Please try again."
        );
    }
 
     return text;
   }


    private boolean isRetryable(int code) {
        return code == 429 || code >= 500;
    }


private AiServiceException translate(RestClientResponseException e) {
    int code = e.getStatusCode().value();

    log.error(
        "Gemini API returned HTTP status {}. Response: {}",
        code,
        e.getResponseBodyAsString()
    );

    if (code == 429) {
        return new AiServiceException(
            HttpStatus.TOO_MANY_REQUESTS,
            "The AI service is busy. Please wait a minute and try again.",
            e
        );
    }

    if (code >= 500) {
        return new AiServiceException(
            HttpStatus.SERVICE_UNAVAILABLE,
            "The AI service is temporarily unavailable. Please try again shortly.",
            e
        );
    }

    return new AiServiceException(
        HttpStatus.BAD_GATEWAY,
        "The AI service could not process the request. Please check the configuration.",
        e
    );
}

    private void pause() {
        try {
            Thread.sleep(RETRY_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
