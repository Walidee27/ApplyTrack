package com.applytrack.jobapplication;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class JobApplicationTest {

    @Test
    void changerDeStatutMetAJourLaDateDeChangement() throws Exception {
        JobApplication application = new JobApplication(null, "Acme", "Dev", ApplicationStatus.APPLIED, LocalDate.now());
        application.onCreate();
        Instant initial = application.getStatusChangedAt();

        Thread.sleep(5);
        application.changeStatus(ApplicationStatus.INTERVIEW);

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(application.getStatusChangedAt()).isAfter(initial);
    }

    @Test
    void garderLeMemeStatutNeModifiePasLaDate() {
        JobApplication application = new JobApplication(null, "Acme", "Dev", ApplicationStatus.APPLIED, LocalDate.now());
        application.onCreate();
        Instant initial = application.getStatusChangedAt();

        application.changeStatus(ApplicationStatus.APPLIED);

        assertThat(application.getStatusChangedAt()).isEqualTo(initial);
    }
}
