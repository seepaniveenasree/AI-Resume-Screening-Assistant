package com.seepani.Resume_screener.exception;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import com.seepani.Resume_screener.exception.AiServiceException;
import com.seepani.Resume_screener.exception.ErrorResponse;
@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(
            InvalidInputException ex) {

        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @SuppressWarnings("deprecation")
	@ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleTooLarge(
            MaxUploadSizeExceededException ex) {

        return build(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "File is too large. Maximum allowed size is 5 MB."
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex) {

        log.error("Unexpected error", ex);

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong. Please try again."
        );
    }
    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiFailure(
            AiServiceException ex) {
        log.warn("AI failure: {}", ex.getMessage());
        return build(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaType(
            HttpMediaTypeNotSupportedException ex) {
        return build(
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            "Unsupported request format. Please send form data."
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethod(
            HttpRequestMethodNotSupportedException ex) {
        return build(
            HttpStatus.METHOD_NOT_ALLOWED,
            "This endpoint does not support that request method."
        );
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status, String message) {
        ErrorResponse body = new ErrorResponse(
            status.value(),
            status.getReasonPhrase(),
            message,
            Instant.now()
        );
        return ResponseEntity.status(status).body(body);
    }
}
