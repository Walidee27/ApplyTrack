package com.applytrack.user;

public record UserResponse(
        Long id, String email, String displayName, boolean remindersEnabled, int reminderAfterDays) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.isRemindersEnabled(),
                user.getReminderAfterDays());
    }
}
