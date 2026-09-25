package com.applytrack.reminder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.applytrack.IntegrationTest;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class ReminderServiceIT extends IntegrationTest {

    @MockitoBean
    JavaMailSender mailSender;

    @Autowired
    ReminderService reminderService;

    @Autowired
    JdbcTemplate jdbc;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        // Isole chaque test : on repart d'une base sans candidatures
        jdbc.update("delete from job_applications");
        clearInvocations(mailSender);
        token = registerAndGetToken();
    }

    @Test
    void envoieUnSeulEmailRecapitulatifPuisNeRelancePlus() throws Exception {
        long acme = create("Acme");
        long globex = create("Globex");
        backdate(acme, 10);
        backdate(globex, 8);

        assertThat(reminderService.sendDueReminders()).isEqualTo(1);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertThat(message.getSubject()).isEqualTo("ApplyTrack · 2 candidatures à relancer");
        assertThat(message.getText()).contains("Acme", "Globex", "sans nouvelles depuis 10 jours");

        // Deuxième passage le même jour : rien de neuf, aucun nouvel e-mail
        clearInvocations(mailSender);
        assertThat(reminderService.sendDueReminders()).isZero();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void neRelancePasAvantLeDelaiNiLesCandidaturesQuiOntAvance() throws Exception {
        long recent = create("Récente");
        backdate(recent, 3); // délai par défaut : 7 jours

        long interview = create("Entretien SA");
        mockMvc.perform(patch("/api/applications/{id}/status", interview)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "INTERVIEW"))))
                .andExpect(status().isOk());
        backdate(interview, 30);

        assertThat(reminderService.sendDueReminders()).isZero();
    }

    @Test
    void respecteLesPreferencesDeLUtilisateur() throws Exception {
        long id = create("Acme");
        backdate(id, 4);

        updatePreferences(true, 3);
        assertThat(reminderService.sendDueReminders()).isEqualTo(1);

        long other = create("Initech");
        backdate(other, 20);
        updatePreferences(false, 3);
        assertThat(reminderService.sendDueReminders()).isZero();
    }

    private long create(String company) throws Exception {
        String response = mockMvc.perform(post("/api/applications")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "company", company,
                                "title", "Alternance développeur",
                                "status", "APPLIED",
                                "appliedOn", LocalDate.now().minusDays(30).toString()))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return readJson(response).get("id").asLong();
    }

    /** Simule une candidature restée sans changement de statut pendant {@code days} jours. */
    private void backdate(long applicationId, int days) {
        jdbc.update("update job_applications set status_changed_at = now() - make_interval(days => ?) where id = ?",
                days, applicationId);
    }

    private void updatePreferences(boolean enabled, int days) throws Exception {
        mockMvc.perform(put("/api/users/me/preferences")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("remindersEnabled", enabled, "reminderAfterDays", days))))
                .andExpect(status().isOk());
    }
}
