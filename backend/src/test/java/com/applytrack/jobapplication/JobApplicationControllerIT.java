package com.applytrack.jobapplication;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

class JobApplicationControllerIT extends IntegrationTest {

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        token = registerAndGetToken();
    }

    @Test
    void cycleDeVieCompletDUneCandidature() throws Exception {
        long id = create(token, applicationBody("Acme", "Développeur Java"));

        mockMvc.perform(get("/api/applications").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].company").value("Acme"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"));

        mockMvc.perform(patch("/api/applications/{id}/status", id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "INTERVIEW"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INTERVIEW"));

        Map<String, Object> updated = applicationBody("Acme", "Développeur Java / Spring");
        updated.put("status", "INTERVIEW");
        updated.put("notes", "Entretien technique mardi");
        mockMvc.perform(put("/api/applications/{id}", id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Développeur Java / Spring"))
                .andExpect(jsonPath("$.notes").value("Entretien technique mardi"));

        mockMvc.perform(delete("/api/applications/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/applications/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void unUtilisateurNeVoitPasLesCandidaturesDUnAutre() throws Exception {
        long id = create(token, applicationBody("Secrète SA", "Stage"));
        String otherToken = registerAndGetToken();

        mockMvc.perform(get("/api/applications").header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/applications/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/applications/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void refuseLAccesSansJeton() throws Exception {
        mockMvc.perform(get("/api/applications")).andExpect(status().isUnauthorized());
    }

    @Test
    void valideLesDonneesDeLaCandidature() throws Exception {
        Map<String, Object> invalid = applicationBody("", "Poste");
        invalid.put("jobUrl", "pas une url");
        invalid.put("appliedOn", LocalDate.now().plusDays(3).toString());

        mockMvc.perform(post("/api/applications")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.company").exists())
                .andExpect(jsonPath("$.errors.jobUrl").exists())
                .andExpect(jsonPath("$.errors.appliedOn").exists());
    }

    private long create(String authToken, Map<String, Object> body) throws Exception {
        String response = mockMvc.perform(post("/api/applications")
                        .header(HttpHeaders.AUTHORIZATION, bearer(authToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return readJson(response).get("id").asLong();
    }

    private static Map<String, Object> applicationBody(String company, String title) {
        Map<String, Object> body = new HashMap<>();
        body.put("company", company);
        body.put("title", title);
        body.put("location", "Paris");
        body.put("jobUrl", "https://example.com/offre/42");
        body.put("status", "APPLIED");
        body.put("appliedOn", LocalDate.now().toString());
        return body;
    }
}
