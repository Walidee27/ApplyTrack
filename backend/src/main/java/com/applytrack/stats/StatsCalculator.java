package com.applytrack.stats;

import com.applytrack.jobapplication.ApplicationStatus;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Calcul pur des statistiques, sans accès à la base : facile à tester unitairement. */
public final class StatsCalculator {

    /** Statuts qui signifient que l'entreprise a répondu, positivement ou non. */
    static final Set<ApplicationStatus> RESPONSE_STATUSES =
            EnumSet.of(ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER, ApplicationStatus.REJECTED);

    static final Set<ApplicationStatus> INTERVIEW_STATUSES =
            EnumSet.of(ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER);

    static final int WEEKS = 12;

    public record ApplicationSnapshot(long id, LocalDate appliedOn, ApplicationStatus status) {
    }

    public record StatusEvent(long applicationId, ApplicationStatus toStatus, Instant changedAt) {
    }

    public record WeeklyCount(LocalDate weekStart, long count) {
    }

    public record Stats(
            int total,
            Map<ApplicationStatus, Long> byStatus,
            double responseRate,
            double interviewRate,
            Double averageResponseDays,
            List<WeeklyCount> weekly) {
    }

    private StatsCalculator() {
    }

    /**
     * @param events historique des statuts, trié par date croissante
     * @param today  date du jour dans le fuseau {@code zone}
     */
    public static Stats compute(
            List<ApplicationSnapshot> applications, List<StatusEvent> events, LocalDate today, ZoneId zone) {
        Map<ApplicationStatus, Long> byStatus = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            byStatus.put(status, 0L);
        }
        applications.forEach(application -> byStatus.merge(application.status(), 1L, Long::sum));

        // Pour chaque candidature : statuts déjà atteints et date de la première réponse
        Map<Long, Set<ApplicationStatus>> reached = new HashMap<>();
        Map<Long, Instant> firstResponse = new HashMap<>();
        for (StatusEvent event : events) {
            reached.computeIfAbsent(event.applicationId(), id -> EnumSet.noneOf(ApplicationStatus.class))
                    .add(event.toStatus());
            if (RESPONSE_STATUSES.contains(event.toStatus())) {
                firstResponse.putIfAbsent(event.applicationId(), event.changedAt());
            }
        }

        int total = applications.size();
        long responded = 0;
        long interviewed = 0;
        long responseDaysSum = 0;
        long responseDaysCount = 0;
        for (ApplicationSnapshot application : applications) {
            Set<ApplicationStatus> statuses = reached.getOrDefault(application.id(), EnumSet.of(application.status()));
            statuses.add(application.status());
            if (statuses.stream().anyMatch(RESPONSE_STATUSES::contains)) {
                responded++;
            }
            if (statuses.stream().anyMatch(INTERVIEW_STATUSES::contains)) {
                interviewed++;
            }
            Instant response = firstResponse.get(application.id());
            if (response != null) {
                long days = ChronoUnit.DAYS.between(application.appliedOn(), response.atZone(zone).toLocalDate());
                if (days >= 0) {
                    responseDaysSum += days;
                    responseDaysCount++;
                }
            }
        }

        return new Stats(
                total,
                byStatus,
                ratio(responded, total),
                ratio(interviewed, total),
                responseDaysCount == 0 ? null : (double) responseDaysSum / responseDaysCount,
                weekly(applications, today));
    }

    /** Nombre de candidatures envoyées par semaine (lundi), sur les 12 dernières semaines, semaine en cours comprise. */
    private static List<WeeklyCount> weekly(List<ApplicationSnapshot> applications, LocalDate today) {
        LocalDate currentWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate firstWeek = currentWeek.minusWeeks(WEEKS - 1);

        long[] counts = new long[WEEKS];
        for (ApplicationSnapshot application : applications) {
            LocalDate week = application.appliedOn().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            long index = ChronoUnit.WEEKS.between(firstWeek, week);
            if (index >= 0 && index < WEEKS) {
                counts[(int) index]++;
            }
        }

        List<WeeklyCount> result = new ArrayList<>(WEEKS);
        for (int i = 0; i < WEEKS; i++) {
            result.add(new WeeklyCount(firstWeek.plusWeeks(i), counts[i]));
        }
        return result;
    }

    private static double ratio(long part, int total) {
        return total == 0 ? 0 : (double) part / total;
    }
}
