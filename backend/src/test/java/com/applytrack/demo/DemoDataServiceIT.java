package com.applytrack.demo;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "app.demo.enabled=true")
class DemoDataServiceIT extends IntegrationTest {

    @Autowired
    DemoDataService demoDataService;

    @Test
    void leCompteDeDemoEstUtilisableEtSeReinitialise() throws Exception {
        String token = loginDemo();

        String list = mockMvc.perform(get("/api/applications").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(11)))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/stats").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.total").value(11))
                .andExpect(jsonPath("$.byStatus.OFFER").value(1))
                .andExpect(jsonPath("$.averageResponseDays").isNumber());

        // Un visiteur supprime une candidature…
        long firstId = readJson(list).get(0).get("id").asLong();
        mockMvc.perform(delete("/api/applications/{id}", firstId).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        // … la réinitialisation nocturne remet le jeu de données complet
        demoDataService.reset();
        mockMvc.perform(get("/api/applications").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$", hasSize(11)));
    }

    private String loginDemo() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", DemoDataService.DEMO_EMAIL, "password", DemoDataService.DEMO_PASSWORD))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return readJson(response).get("token").asText();
    }
}
