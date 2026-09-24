package com.applytrack.jobapplication;

import com.applytrack.auth.CurrentUser;
import com.applytrack.jobapplication.JobApplicationDtos.JobApplicationRequest;
import com.applytrack.jobapplication.JobApplicationDtos.JobApplicationResponse;
import com.applytrack.jobapplication.JobApplicationDtos.StatusUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Candidatures")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobApplicationResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return service.list(CurrentUser.id(jwt));
    }

    @GetMapping("/{id}")
    public JobApplicationResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.get(CurrentUser.id(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody JobApplicationRequest request) {
        return service.create(CurrentUser.id(jwt), request);
    }

    @PutMapping("/{id}")
    public JobApplicationResponse update(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody JobApplicationRequest request) {
        return service.update(CurrentUser.id(jwt), id, request);
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponse updateStatus(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateStatus(CurrentUser.id(jwt), id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.delete(CurrentUser.id(jwt), id);
    }
}
