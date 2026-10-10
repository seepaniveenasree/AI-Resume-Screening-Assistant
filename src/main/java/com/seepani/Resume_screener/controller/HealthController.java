package com.seepani.Resume_screener.controller;
import java.util.*;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {
	@GetMapping("/health")
	public Map<String,String> health(){
		return Map.of("status", "UP");
	}
}
