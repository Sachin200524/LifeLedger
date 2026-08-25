package com.lifeledger.repository;

import com.lifeledger.entity.Document;
import com.lifeledger.entity.Policy;
import com.lifeledger.entity.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, Long> {
    List<PolicyDocument> findByPolicy(Policy policy);
    List<PolicyDocument> findByDocument(Document document);
    void deleteByPolicy(Policy policy);
}
