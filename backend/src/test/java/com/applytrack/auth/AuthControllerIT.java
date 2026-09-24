package com.applytrack.auth;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

class AuthControllerIT extends IntegrationTest {

    @Test
    void inscriptionPuisConnexionRenvoientUnJetonValide() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "Walide@Example.com", "password", "motdepasse123", "displayName", "Walide"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("walide@example.com"))
                .andExpect(jsonPath("$.user", not(hasKey("passwordHash"))));

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "walide@example.com", "password", "motdepasse123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = readJson(response).get("token").asText();

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Walide"));
    }

    @Test
    void refuseUnEmailDejaUtilise() throws Exception {
        String body = json(Map.of("email", "doublon@example.com", "password", "motdepasse123", "displayName", "A"));
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void refuseUnMauvaisMotDePasse() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "login@example.com", "password", "motdepasse123", "displayName", "A"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "login@example.com", "password", "mauvais-mot-de-passe"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void valideLesChampsDInscription() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "pas-un-email", "password", "court", "displayName", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists())
                .andExpect(jsonPath("$.errors.displayName").exists());
    }

    @Test
    void refuseUnJetonInvalide() throws Exception {
        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer("pas.un.jwt")))
                .andExpect(status().isUnauthorized());
    }
}
