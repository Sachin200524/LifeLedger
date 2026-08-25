package com.lifeledger.repository;

import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {
    List<Nominee> findByOwnerOrderByCreatedAtDesc(User owner);
    Optional<Nominee> findByIdAndOwner(Long id, User owner);
    List<Nominee> findByEmail(String email);
    List<Nominee> findByNomineeUser(User nomineeUser);
    Optional<Nominee> findByInvitationToken(String token);
    long countByOwner(User owner);
    long countByOwnerAndVerificationStatus(User owner, Nominee.VerificationStatus status);
}
