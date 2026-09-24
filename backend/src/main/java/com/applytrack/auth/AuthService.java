package com.applytrack.auth;

import com.applytrack.auth.AuthDtos.AuthResponse;
import com.applytrack.auth.AuthDtos.LoginRequest;
import com.applytrack.auth.AuthDtos.RegisterRequest;
import com.applytrack.common.ConflictException;
import com.applytrack.common.ResourceNotFoundException;
import com.applytrack.user.User;
import com.applytrack.user.UserRepository;
import com.applytrack.user.UserResponse;
import java.util.Locale;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (users.existsByEmail(email)) {
            throw new ConflictException("Un compte existe déjà avec cet e-mail");
        }
        User user = users.save(new User(email, passwordEncoder.encode(request.password()), request.displayName().trim()));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Même message que l'e-mail existe ou non, pour ne pas révéler les comptes inscrits
        User user = users.findByEmail(normalize(request.email()))
                .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return users.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(tokenService.issue(user), UserResponse.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
