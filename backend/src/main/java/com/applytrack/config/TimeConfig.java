package com.applytrack.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TimeConfig {

    /** Horloge injectable : les tests peuvent la remplacer pour simuler le passage du temps. */
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
