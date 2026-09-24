package com.applytrack.jobapplication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.validator.constraints.URL;

public final class JobApplicationDtos {

    private JobApplicationDtos() {
    }

    public record JobApplicationRequest(
            @NotBlank @Size(max = 150) String company,
            @NotBlank @Size(max = 150) String title,
            @Size(max = 150) String location,
            @URL @Size(max = 2048) String jobUrl,
            @NotNull ApplicationStatus status,
            @NotNull @PastOrPresent LocalDate appliedOn,
            @Size(max = 5000) String notes) {
    }

    public record StatusUpdateRequest(@NotNull ApplicationStatus status) {
    }

    public record JobApplicationResponse(
            Long id,
            String company,
            String title,
            String location,
            String jobUrl,
            ApplicationStatus status,
            LocalDate appliedOn,
            String notes,
            Instant createdAt,
            Instant updatedAt,
            Instant statusChangedAt) {

        public static JobApplicationResponse from(JobApplication application) {
            return new JobApplicationResponse(
                    application.getId(),
                    application.getCompany(),
                    application.getTitle(),
                    application.getLocation(),
                    application.getJobUrl(),
                    application.getStatus(),
                    application.getAppliedOn(),
                    application.getNotes(),
                    application.getCreatedAt(),
                    application.getUpdatedAt(),
                    application.getStatusChangedAt());
        }
    }
}
