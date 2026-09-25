package com.applytrack.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;

// Valeur volontairement mal saisie : espaces et « / » final, comme on les colle souvent depuis un navigateur
@TestPropertySource(properties = "app.cors.allowed-origins= https://applytrack.example.app/ , http://localhost:5173")
class CorsIT extends IntegrationTest {

    @Test
    void autoriseLOrigineDuFrontMalgreLeSlashFinal() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "https://applytrack.example.app")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://applytrack.example.app"));
    }

    @Test
    void refuseUneOrigineInconnue() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "https://site-malveillant.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isForbidden());
    }
}
