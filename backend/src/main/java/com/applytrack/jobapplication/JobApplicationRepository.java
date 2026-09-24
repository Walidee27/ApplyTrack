package com.applytrack.jobapplication;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByAppliedOnDescIdDesc(Long userId);

    /** Toujours filtrer par propriétaire : un utilisateur ne doit jamais voir les candidatures d'un autre. */
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
}
