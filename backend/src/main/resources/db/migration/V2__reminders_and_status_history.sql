-- Préférences de relance par utilisateur
alter table users
    add column reminders_enabled   boolean not null default true,
    add column reminder_after_days integer not null default 7
        constraint chk_users_reminder_after_days check (reminder_after_days between 1 and 60);

-- Date de la dernière relance envoyée : une seule relance par période sans changement de statut
alter table job_applications
    add column last_reminder_at timestamptz;

-- Historique des changements de statut, source des statistiques (délai de réponse, taux d'entretien…)
create table application_status_changes (
    id             bigserial primary key,
    application_id bigint      not null references job_applications (id) on delete cascade,
    from_status    varchar(20),
    to_status      varchar(20) not null,
    changed_at     timestamptz not null
);

create index idx_status_changes_application on application_status_changes (application_id);

-- Les candidatures existantes démarrent leur historique avec leur statut actuel
insert into application_status_changes (application_id, from_status, to_status, changed_at)
select id, null, status, status_changed_at
from job_applications;
