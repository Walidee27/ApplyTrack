package com.applytrack.jobapplication;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByAppliedOnDescIdDesc(Long userId);

    /** Toujours filtrer par propriétaire : un utilisateur ne doit jamais voir les candidatures d'un autre. */
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    /**
     * Candidatures sans nouvelles depuis plus longtemps que le délai choisi par leur propriétaire,
     * et pas encore relancées depuis leur dernier changement de statut.
     */
    @Query(nativeQuery = true, value = """
            select a.* from job_applications a
            join users u on u.id = a.user_id
            where u.reminders_enabled
              and a.status in ('APPLIED', 'FOLLOW_UP')
              and a.status_changed_at <= cast(:now as timestamptz) - make_interval(days => u.reminder_after_days)
              and (a.last_reminder_at is null or a.last_reminder_at < a.status_changed_at)
            order by a.user_id, a.status_changed_at
            """)
    List<JobApplication> findDueForReminder(Instant now);
}
