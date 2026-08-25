package com.lifeledger.repository;

import com.lifeledger.entity.Document;
import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.NomineePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NomineePermissionRepository extends JpaRepository<NomineePermission, Long> {
    List<NomineePermission> findByNominee(Nominee nominee);
    List<NomineePermission> findByDocument(Document document);
    void deleteByNominee(Nominee nominee);
}
