package com.applytrack.stats;

import com.applytrack.auth.CurrentUser;
import com.applytrack.stats.StatsCalculator.Stats;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@Tag(name = "Statistiques")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public Stats get(@AuthenticationPrincipal Jwt jwt) {
        return statsService.forUser(CurrentUser.id(jwt));
    }
}
