package com.lifeledger.repository;

import com.lifeledger.entity.RiskScore;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {
    Optional<RiskScore> findTopByUserOrderByCalculatedAtDesc(User user);
    List<RiskScore> findByUserOrderByCalculatedAtDesc(User user);
}
