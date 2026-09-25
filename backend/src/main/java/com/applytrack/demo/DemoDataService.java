package com.applytrack.demo;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Compte de démonstration public : recréé au démarrage puis chaque nuit, avec des candidatures
 * datées par rapport au jour courant pour que le tableau et les statistiques restent vivants.
 * Activé uniquement avec app.demo.enabled=true (variable DEMO_ENABLED).
 */
@Service
@ConditionalOnProperty(prefix = "app.demo", name = "enabled", havingValue = "true")
public class DemoDataService {

    // Domaine réservé (RFC 2606) : aucun e-mail ne peut partir vers une vraie boîte
    public static final String DEMO_EMAIL = "demo@example.com";
    public static final String DEMO_PASSWORD = "demo12345";

    private static final Logger log = LoggerFactory.getLogger(DemoDataService.class);
    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");

    /** Un passage de statut, {@code daysAgo} jours avant aujourd'hui. */
    private record Step(String status, int daysAgo) {
    }

    private record Sample(String company, String title, String location, int appliedDaysAgo, List<Step> steps) {
    }

    private static final List<Sample> SAMPLES = List.of(
            new Sample("Société Générale", "Alternant développeur Java", "La Défense", 60,
                    List.of(new Step("INTERVIEW", 52), new Step("OFFER", 38))),
            new Sample("Thales", "Alternance full-stack React / Spring", "Vélizy", 52, List.of(new Step("REJECTED", 42))),
            new Sample("Capgemini", "Alternant développeur back-end", "Paris", 45, List.of(new Step("INTERVIEW", 36))),
            new Sample("Doctolib", "Alternant développeur back-end", "Paris", 38, List.of(new Step("INTERVIEW", 30))),
            new Sample("Airbus", "Alternance développeur logiciel", "Toulouse", 34, List.of(new Step("REJECTED", 20))),
            new Sample("Orange", "Alternance DevOps", "Châtillon", 26, List.of(new Step("FOLLOW_UP", 15))),
            new Sample("BNP Paribas", "Alternant développeur web", "Paris", 19, List.of()),
            new Sample("Leboncoin", "Alternance développeur React", "Paris", 12, List.of()),
            new Sample("Qonto", "Alternant développeur full-stack", "Paris", 9, List.of(new Step("INTERVIEW", 3))),
            new Sample("Dassault Systèmes", "Alternant ingénieur logiciel", "Vélizy", 4, List.of()),
            new Sample("Ubisoft", "Alternance développeur outils", "Montreuil", 2, List.of()));

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public DemoDataService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, Clock clock) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @EventListener(ApplicationReadyEvent.class)
    void onStartup() {
        reset();
    }

    @Scheduled(cron = "0 0 4 * * *", zone = "Europe/Paris")
    void nightlyReset() {
        reset();
    }

    /** Recrée le compte de démo et ses candidatures. Idempotent. */
    @Transactional
    public void reset() {
        LocalDate today = LocalDate.now(clock.withZone(ZONE));
        Long userId = jdbc.query("select id from users where email = ?", rs -> rs.next() ? rs.getLong(1) : null, DEMO_EMAIL);
        if (userId == null) {
            userId = jdbc.queryForObject("""
                    insert into users (email, password_hash, display_name, created_at, reminders_enabled, reminder_after_days)
                    values (?, ?, 'Compte démo', now(), false, 7) returning id
                    """, Long.class, DEMO_EMAIL, passwordEncoder.encode(DEMO_PASSWORD));
        } else {
            // On remet aussi les préférences d'origine, au cas où un visiteur les aurait modifiées
            jdbc.update("update users set reminders_enabled = false, reminder_after_days = 7 where id = ?", userId);
            jdbc.update("delete from job_applications where user_id = ?", userId);
        }

        for (Sample sample : SAMPLES) {
            LocalDate appliedOn = today.minusDays(sample.appliedDaysAgo());
            Timestamp appliedAt = at(appliedOn);
            Step last = sample.steps().isEmpty() ? null : sample.steps().getLast();
            String status = last == null ? "APPLIED" : last.status();
            Timestamp statusChangedAt = last == null ? appliedAt : at(today.minusDays(last.daysAgo()));

            Long applicationId = jdbc.queryForObject("""
                    insert into job_applications
                        (user_id, company, title, location, status, applied_on, created_at, updated_at, status_changed_at)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?) returning id
                    """, Long.class, userId, sample.company(), sample.title(), sample.location(), status,
                    appliedOn, appliedAt, statusChangedAt, statusChangedAt);

            insertChange(applicationId, null, "APPLIED", appliedAt);
            String previous = "APPLIED";
            for (Step step : sample.steps()) {
                insertChange(applicationId, previous, step.status(), at(today.minusDays(step.daysAgo())));
                previous = step.status();
            }
        }
        log.info("Compte de démo réinitialisé ({} candidatures)", SAMPLES.size());
    }

    private void insertChange(Long applicationId, String from, String to, Timestamp changedAt) {
        jdbc.update("""
                insert into application_status_changes (application_id, from_status, to_status, changed_at)
                values (?, ?, ?, ?)
                """, applicationId, from, to, changedAt);
    }

    private static Timestamp at(LocalDate date) {
        return Timestamp.from(date.atTime(LocalTime.of(10, 0)).atZone(ZONE).toInstant());
    }
}
