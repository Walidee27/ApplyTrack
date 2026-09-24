create table users (
    id            bigserial primary key,
    email         varchar(255) not null unique,
    password_hash varchar(255) not null,
    display_name  varchar(100) not null,
    created_at    timestamptz  not null
);

create table job_applications (
    id                bigserial primary key,
    user_id           bigint       not null references users (id) on delete cascade,
    company           varchar(150) not null,
    title             varchar(150) not null,
    location          varchar(150),
    job_url           varchar(2048),
    status            varchar(20)  not null,
    applied_on        date         not null,
    notes             text,
    created_at        timestamptz  not null,
    updated_at        timestamptz  not null,
    status_changed_at timestamptz  not null,
    constraint chk_job_applications_status
        check (status in ('APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'OFFER', 'REJECTED'))
);

create index idx_job_applications_user on job_applications (user_id);
