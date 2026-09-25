package com.applytrack.jobapplication;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StatusChangeRepository extends JpaRepository<StatusChange, Long> {

    @Query("""
            select c from StatusChange c
            where c.application.user.id = :userId
            order by c.changedAt
            """)
    List<StatusChange> findAllForUser(Long userId);
}
