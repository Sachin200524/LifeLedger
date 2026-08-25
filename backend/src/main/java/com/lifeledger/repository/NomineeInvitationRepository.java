package com.lifeledger.repository;

import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.NomineeInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NomineeInvitationRepository extends JpaRepository<NomineeInvitation, Long> {
    Optional<NomineeInvitation> findByToken(String token);
    Optional<NomineeInvitation> findByNomineeAndAcceptedFalse(Nominee nominee);
}
