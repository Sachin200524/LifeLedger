package com.lifeledger.repository;

import com.lifeledger.entity.ReadinessAssessment;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReadinessAssessmentRepository extends JpaRepository<ReadinessAssessment, Long> {
    Optional<ReadinessAssessment> findTopByUserOrderByCalculatedAtDesc(User user);
    List<ReadinessAssessment> findByUserOrderByCalculatedAtDesc(User user);
}
