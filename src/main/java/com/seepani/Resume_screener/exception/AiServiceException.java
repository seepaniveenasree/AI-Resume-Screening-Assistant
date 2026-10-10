package com.seepani.Resume_screener.exception;

import org.springframework.http.HttpStatus;

public class AiServiceException extends RuntimeException {
	 private final HttpStatus status;

	    public AiServiceException(String message) {
	        this(HttpStatus.BAD_GATEWAY, message, null);
	    }

	    public AiServiceException(String message, Throwable cause) {
	        this(HttpStatus.BAD_GATEWAY, message, cause);
	    }

	    public AiServiceException(HttpStatus status, String message, Throwable cause) {
	        super(message, cause);
	        this.status = status;
	    }

	    public HttpStatus getStatus() {
	        return status;
	    }
}
