package com.applytrack.stats;

import com.applytrack.jobapplication.JobApplicationRepository;
import com.applytrack.jobapplication.StatusChangeRepository;
import com.applytrack.stats.StatsCalculator.ApplicationSnapshot;
import com.applytrack.stats.StatsCalculator.Stats;
import com.applytrack.stats.StatsCalculator.StatusEvent;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");

    private final JobApplicationRepository applications;
    private final StatusChangeRepository statusChanges;
    private final Clock clock;

    public StatsService(JobApplicationRepository applications, StatusChangeRepository statusChanges, Clock clock) {
        this.applications = applications;
        this.statusChanges = statusChanges;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Stats forUser(Long userId) {
        List<ApplicationSnapshot> snapshots = applications.findByUserIdOrderByAppliedOnDescIdDesc(userId).stream()
                .map(a -> new ApplicationSnapshot(a.getId(), a.getAppliedOn(), a.getStatus()))
                .toList();
        List<StatusEvent> events = statusChanges.findAllForUser(userId).stream()
                .map(c -> new StatusEvent(c.getApplication().getId(), c.getToStatus(), c.getChangedAt()))
                .toList();
        return StatsCalculator.compute(snapshots, events, LocalDate.now(clock.withZone(ZONE)), ZONE);
    }
}
