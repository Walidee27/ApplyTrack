package com.applytrack.stats;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.applytrack.jobapplication.ApplicationStatus;
import com.applytrack.stats.StatsCalculator.ApplicationSnapshot;
import com.applytrack.stats.StatsCalculator.Stats;
import com.applytrack.stats.StatsCalculator.StatusEvent;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;

class StatsCalculatorTest {

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final LocalDate TODAY = LocalDate.of(2026, 9, 24); // un jeudi

    @Test
    void sansCandidatureToutEstAZero() {
        Stats stats = StatsCalculator.compute(List.of(), List.of(), TODAY, PARIS);

        assertThat(stats.total()).isZero();
        assertThat(stats.responseRate()).isZero();
        assertThat(stats.averageResponseDays()).isNull();
        assertThat(stats.byStatus()).containsEntry(ApplicationStatus.OFFER, 0L).hasSize(5);
        assertThat(stats.weekly()).hasSize(12).allMatch(week -> week.count() == 0);
    }

    @Test
    void calculeLesTauxEtLeDelaiMoyenDeReponse() {
        List<ApplicationSnapshot> applications = List.of(
                new ApplicationSnapshot(1, LocalDate.of(2026, 9, 1), ApplicationStatus.OFFER),
                new ApplicationSnapshot(2, LocalDate.of(2026, 9, 1), ApplicationStatus.REJECTED),
                new ApplicationSnapshot(3, LocalDate.of(2026, 9, 10), ApplicationStatus.APPLIED),
                // Est passée en entretien puis est revenue en relance : compte quand même comme une réponse
                new ApplicationSnapshot(4, LocalDate.of(2026, 9, 5), ApplicationStatus.FOLLOW_UP));
        List<StatusEvent> events = List.of(
                new StatusEvent(1, ApplicationStatus.APPLIED, instant("2026-09-01T09:00:00Z")),
                new StatusEvent(1, ApplicationStatus.INTERVIEW, instant("2026-09-05T09:00:00Z")), // 4 j
                new StatusEvent(1, ApplicationStatus.OFFER, instant("2026-09-15T09:00:00Z")),
                new StatusEvent(2, ApplicationStatus.REJECTED, instant("2026-09-11T09:00:00Z")), // 10 j
                new StatusEvent(4, ApplicationStatus.INTERVIEW, instant("2026-09-12T09:00:00Z")), // 7 j
                new StatusEvent(4, ApplicationStatus.FOLLOW_UP, instant("2026-09-20T09:00:00Z")));

        Stats stats = StatsCalculator.compute(applications, events, TODAY, PARIS);

        assertThat(stats.total()).isEqualTo(4);
        assertThat(stats.responseRate()).isEqualTo(0.75);
        assertThat(stats.interviewRate()).isEqualTo(0.5);
        assertThat(stats.averageResponseDays()).isCloseTo(7.0, within(0.001));
    }

    @Test
    void regroupeLesCandidaturesParSemaineDuLundi() {
        List<ApplicationSnapshot> applications = List.of(
                new ApplicationSnapshot(1, LocalDate.of(2026, 9, 21), ApplicationStatus.APPLIED), // lundi, semaine en cours
                new ApplicationSnapshot(2, LocalDate.of(2026, 9, 24), ApplicationStatus.APPLIED), // jeudi, même semaine
                new ApplicationSnapshot(3, LocalDate.of(2026, 9, 20), ApplicationStatus.APPLIED), // dimanche, semaine d'avant
                new ApplicationSnapshot(4, LocalDate.of(2026, 1, 5), ApplicationStatus.APPLIED)); // hors des 12 semaines

        Stats stats = StatsCalculator.compute(applications, List.of(), TODAY, PARIS);

        assertThat(stats.weekly().getLast().weekStart()).isEqualTo(LocalDate.of(2026, 9, 21));
        assertThat(stats.weekly().getLast().count()).isEqualTo(2);
        assertThat(stats.weekly().get(10).count()).isEqualTo(1);
        assertThat(stats.weekly().stream().mapToLong(StatsCalculator.WeeklyCount::count).sum()).isEqualTo(3);
    }

    private static Instant instant(String value) {
        return Instant.parse(value);
    }
}
