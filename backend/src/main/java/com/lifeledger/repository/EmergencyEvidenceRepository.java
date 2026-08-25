package com.lifeledger.repository;

import com.lifeledger.entity.EmergencyEvidence;
import com.lifeledger.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyEvidenceRepository extends JpaRepository<EmergencyEvidence, Long> {
    List<EmergencyEvidence> findByEmergencyRequest(EmergencyRequest emergencyRequest);
}
