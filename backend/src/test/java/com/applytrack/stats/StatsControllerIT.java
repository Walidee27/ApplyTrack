package com.applytrack.stats;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

class StatsControllerIT extends IntegrationTest {

    @Test
    void lesStatistiquesRefletentLHistoriqueDesStatuts() throws Exception {
        String token = registerAndGetToken();
        long first = create(token, "Acme");
        create(token, "Globex");

        mockMvc.perform(patch("/api/applications/{id}/status", first)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "INTERVIEW"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/stats").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.byStatus.APPLIED").value(1))
                .andExpect(jsonPath("$.byStatus.INTERVIEW").value(1))
                .andExpect(jsonPath("$.responseRate").value(0.5))
                .andExpect(jsonPath("$.interviewRate").value(0.5))
                .andExpect(jsonPath("$.averageResponseDays").value(1.0)) // envoyée hier, réponse aujourd'hui
                .andExpect(jsonPath("$.weekly", hasSize(12)));
    }

    @Test
    void lesPreferencesDeRelanceSontModifiablesEtValidees() throws Exception {
        String token = registerAndGetToken();

        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.remindersEnabled").value(true))
                .andExpect(jsonPath("$.reminderAfterDays").value(7));

        mockMvc.perform(put("/api/users/me/preferences")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("remindersEnabled", false, "reminderAfterDays", 14))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remindersEnabled").value(false))
                .andExpect(jsonPath("$.reminderAfterDays").value(14));

        mockMvc.perform(put("/api/users/me/preferences")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("remindersEnabled", true, "reminderAfterDays", 0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.reminderAfterDays").exists());
    }

    private long create(String token, String company) throws Exception {
        String response = mockMvc.perform(post("/api/applications")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "company", company,
                                "title", "Stage",
                                "status", "APPLIED",
                                // Veille à Paris : jamais dans le futur, quel que soit le fuseau de la JVM
                                "appliedOn", LocalDate.now(ZoneId.of("Europe/Paris")).minusDays(1).toString()))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return readJson(response).get("id").asLong();
    }
}
