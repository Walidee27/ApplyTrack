package com.applytrack.jobapplication;

import com.applytrack.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 150)
    private String location;

    @Column(name = "job_url", length = 2048)
    private String jobUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Date du dernier changement de statut : sert à détecter les candidatures à relancer. */
    @Column(name = "status_changed_at", nullable = false)
    private Instant statusChangedAt;

    /** Date de la dernière relance envoyée pour cette candidature. */
    @Column(name = "last_reminder_at")
    private Instant lastReminderAt;

    protected JobApplication() {
        // requis par JPA
    }

    public JobApplication(User user, String company, String title, ApplicationStatus status, LocalDate appliedOn) {
        this.user = user;
        this.company = company;
        this.title = title;
        this.status = status;
        this.appliedOn = appliedOn;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        statusChangedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void updateDetails(String company, String title, String location, String jobUrl, LocalDate appliedOn, String notes) {
        this.company = company;
        this.title = title;
        this.location = location;
        this.jobUrl = jobUrl;
        this.appliedOn = appliedOn;
        this.notes = notes;
    }

    /** Change le statut et renvoie {@code true} si le statut a réellement changé. */
    public boolean changeStatus(ApplicationStatus newStatus) {
        if (status == newStatus) {
            return false;
        }
        status = newStatus;
        statusChangedAt = Instant.now();
        return true;
    }

    public void markReminded(Instant remindedAt) {
        lastReminderAt = remindedAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getCompany() {
        return company;
    }

    public String getTitle() {
        return title;
    }

    public String getLocation() {
        return location;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDate getAppliedOn() {
        return appliedOn;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getStatusChangedAt() {
        return statusChangedAt;
    }

    public Instant getLastReminderAt() {
        return lastReminderAt;
    }
}
