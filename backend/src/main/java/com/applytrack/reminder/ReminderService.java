package com.applytrack.reminder;

import com.applytrack.jobapplication.JobApplication;
import com.applytrack.jobapplication.JobApplicationRepository;
import com.applytrack.user.User;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    private final JobApplicationRepository applications;
    private final ReminderMailer mailer;
    private final Clock clock;

    public ReminderService(JobApplicationRepository applications, ReminderMailer mailer, Clock clock) {
        this.applications = applications;
        this.mailer = mailer;
        this.clock = clock;
    }

    /**
     * Envoie un seul e-mail par utilisateur, qui regroupe toutes ses candidatures à relancer.
     * Un échec d'envoi n'empêche pas les autres utilisateurs d'être relancés, et les candidatures
     * concernées restent éligibles au passage suivant.
     *
     * @return le nombre d'e-mails envoyés
     */
    @Transactional
    public int sendDueReminders() {
        Instant now = Instant.now(clock);
        Map<User, List<JobApplication>> byUser = new LinkedHashMap<>();
        for (JobApplication application : applications.findDueForReminder(now)) {
            byUser.computeIfAbsent(application.getUser(), user -> new ArrayList<>()).add(application);
        }

        int sent = 0;
        for (Map.Entry<User, List<JobApplication>> entry : byUser.entrySet()) {
            try {
                mailer.send(entry.getKey(), entry.getValue(), now);
                entry.getValue().forEach(application -> application.markReminded(now));
                sent++;
            } catch (MailException exception) {
                log.warn("Relance impossible pour l'utilisateur {}", entry.getKey().getId(), exception);
            }
        }
        log.info("{} e-mail(s) de relance envoyé(s)", sent);
        return sent;
    }
}
