package com.applytrack.user;

import com.applytrack.auth.CurrentUser;
import com.applytrack.common.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/preferences")
@Tag(name = "Préférences")
public class UserPreferencesController {

    public record PreferencesRequest(
            @NotNull Boolean remindersEnabled,
            @NotNull @Min(1) @Max(60) Integer reminderAfterDays) {
    }

    private final UserRepository users;

    public UserPreferencesController(UserRepository users) {
        this.users = users;
    }

    @PutMapping
    @Transactional
    public UserResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PreferencesRequest request) {
        User user = users.findById(CurrentUser.id(jwt))
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        user.updateReminderPreferences(request.remindersEnabled(), request.reminderAfterDays());
        return UserResponse.from(users.saveAndFlush(user));
    }
}
