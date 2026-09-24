package com.applytrack.auth;

import org.springframework.security.oauth2.jwt.Jwt;

/** Extrait l'identifiant de l'utilisateur connecté depuis le sujet du JWT. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
