package com.applytrack.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Reminders reminders) {

    public record Jwt(String secret, Duration expiration) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    /**
     * @param enabled     active la tâche planifiée
     * @param cron        planification (fuseau Europe/Paris)
     * @param mailFrom    expéditeur des e-mails
     * @param frontendUrl lien inséré dans les e-mails
     */
    public record Reminders(boolean enabled, String cron, String mailFrom, String frontendUrl) {
    }
}
