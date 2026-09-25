package com.applytrack.reminder;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/** Déclenche les relances chaque jour (8 h, heure de Paris, par défaut). Désactivable avec app.reminders.enabled=false. */
@Configuration
@EnableScheduling
@ConditionalOnProperty(prefix = "app.reminders", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ReminderScheduler {

    private final ReminderService reminderService;

    public ReminderScheduler(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @Scheduled(cron = "${app.reminders.cron}", zone = "Europe/Paris")
    void sendDailyReminders() {
        reminderService.sendDueReminders();
    }
}
