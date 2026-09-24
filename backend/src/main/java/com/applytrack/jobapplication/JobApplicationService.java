package com.applytrack.jobapplication;

import com.applytrack.common.ResourceNotFoundException;
import com.applytrack.jobapplication.JobApplicationDtos.JobApplicationRequest;
import com.applytrack.jobapplication.JobApplicationDtos.JobApplicationResponse;
import com.applytrack.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository applications;
    private final UserRepository users;

    public JobApplicationService(JobApplicationRepository applications, UserRepository users) {
        this.applications = applications;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> list(Long userId) {
        return applications.findByUserIdOrderByAppliedOnDescIdDesc(userId).stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse get(Long userId, Long id) {
        return JobApplicationResponse.from(find(userId, id));
    }

    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        JobApplication application = new JobApplication(
                users.getReferenceById(userId),
                request.company().trim(),
                request.title().trim(),
                request.status(),
                request.appliedOn());
        applyDetails(application, request);
        return JobApplicationResponse.from(applications.save(application));
    }

    public JobApplicationResponse update(Long userId, Long id, JobApplicationRequest request) {
        JobApplication application = find(userId, id);
        applyDetails(application, request);
        application.changeStatus(request.status());
        return JobApplicationResponse.from(applications.saveAndFlush(application));
    }

    public JobApplicationResponse updateStatus(Long userId, Long id, ApplicationStatus status) {
        JobApplication application = find(userId, id);
        application.changeStatus(status);
        return JobApplicationResponse.from(applications.saveAndFlush(application));
    }

    public void delete(Long userId, Long id) {
        applications.delete(find(userId, id));
    }

    private JobApplication find(Long userId, Long id) {
        return applications.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable"));
    }

    private static void applyDetails(JobApplication application, JobApplicationRequest request) {
        application.updateDetails(
                request.company().trim(),
                request.title().trim(),
                blankToNull(request.location()),
                blankToNull(request.jobUrl()),
                request.appliedOn(),
                blankToNull(request.notes()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
