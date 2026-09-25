package com.applytrack.reminder;

import com.applytrack.config.AppProperties;
import com.applytrack.jobapplication.JobApplication;
import com.applytrack.user.User;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/** Rédige et envoie l'e-mail récapitulatif des candidatures à relancer. */
@Component
public class ReminderMailer {

    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public ReminderMailer(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public void send(User user, List<JobApplication> applications, Instant now) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.reminders().mailFrom());
        message.setTo(user.getEmail());
        message.setSubject(subject(applications.size()));
        message.setText(body(user, applications, now));
        mailSender.send(message);
    }

    static String subject(int count) {
        return count == 1
                ? "ApplyTrack · 1 candidature à relancer"
                : "ApplyTrack · %d candidatures à relancer".formatted(count);
    }

    private String body(User user, List<JobApplication> applications, Instant now) {
        StringBuilder text = new StringBuilder()
                .append("Bonjour ").append(user.getDisplayName()).append(",\n\n")
                .append("Ces candidatures n'ont pas bougé depuis un moment, c'est le bon moment pour relancer :\n\n");
        for (JobApplication application : applications) {
            long days = Duration.between(application.getStatusChangedAt(), now).toDays();
            text.append("• ").append(application.getCompany()).append(" — ").append(application.getTitle())
                    .append(" (sans nouvelles depuis ").append(days).append(" jours)\n");
        }
        return text
                .append("\nOuvre ton tableau : ").append(properties.reminders().frontendUrl()).append("/app\n\n")
                .append("Tu peux changer le délai ou désactiver ces rappels dans tes préférences.\n")
                .toString();
    }
}
