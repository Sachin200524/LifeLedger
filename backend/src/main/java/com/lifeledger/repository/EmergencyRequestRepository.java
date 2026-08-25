package com.lifeledger.repository;

import com.lifeledger.entity.EmergencyRequest;
import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByOwnerOrderByRequestedAtDesc(User owner);
    List<EmergencyRequest> findByNomineeOrderByRequestedAtDesc(Nominee nominee);
    Optional<EmergencyRequest> findByIdAndOwner(Long id, User owner);
    Optional<EmergencyRequest> findByIdAndNominee(Long id, Nominee nominee);
    List<EmergencyRequest> findByStatus(EmergencyRequest.EmergencyStatus status);
    List<EmergencyRequest> findByStatusAndAccessExpiresAtBefore(EmergencyRequest.EmergencyStatus status, LocalDateTime dateTime);
    List<EmergencyRequest> findByStatusAndWaitingPeriodEndsAtBefore(EmergencyRequest.EmergencyStatus status, LocalDateTime dateTime);
    long countByOwnerAndStatus(User owner, EmergencyRequest.EmergencyStatus status);
    long countByStatus(EmergencyRequest.EmergencyStatus status);
}
