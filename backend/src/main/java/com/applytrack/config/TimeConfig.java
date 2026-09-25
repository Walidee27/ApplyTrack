package com.applytrack.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Horloge et tâches planifiées (relances, réinitialisation du compte de démo). */
@Configuration
@EnableScheduling
public class TimeConfig {

    /** Horloge injectable : les tests peuvent la remplacer pour simuler le passage du temps. */
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
