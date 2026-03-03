package com.budgetwise.controller;

import com.budgetwise.service.AIAdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
public class AIController {

    private final AIAdvisorService aiAdvisorService;

    public AIController(AIAdvisorService aiAdvisorService) {
        this.aiAdvisorService = aiAdvisorService;
    }

    @GetMapping("/tips")
    public ResponseEntity<List<Map<String, String>>> getTips(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(aiAdvisorService.getAdvice(userDetails.getUsername()));
    }
}
