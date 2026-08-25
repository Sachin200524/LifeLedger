package com.lifeledger.repository;

import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.Policy;
import com.lifeledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByOwnerOrderByCreatedAtDesc(User owner);
    Optional<Policy> findByIdAndOwner(Long id, User owner);
    List<Policy> findByNominee(Nominee nominee);
    List<Policy> findByNomineeAndActiveTrue(Nominee nominee);
    long countByOwner(User owner);
    long countByOwnerAndActiveTrue(User owner);
    long countByActiveTrue();
}
