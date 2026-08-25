package com.lifeledger.service;

import com.lifeledger.dto.policy.PolicyRequest;
import com.lifeledger.entity.*;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.repository.NomineeRepository;
import com.lifeledger.repository.PolicyDocumentRepository;
import com.lifeledger.repository.PolicyRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final PolicyDocumentRepository policyDocumentRepository;
    private final NomineeRepository nomineeRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public PolicyRequest.PolicyDto createPolicy(User owner, PolicyRequest.CreatePolicyDto dto, HttpServletRequest request) {
        Nominee nominee = nomineeRepository.findByIdAndOwner(dto.getNomineeId(), owner)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found or does not belong to your vault"));

        if (dto.getDocumentIds() == null || dto.getDocumentIds().isEmpty()) {
            throw new IllegalArgumentException("At least one document must be linked to the policy");
        }

        Policy policy = Policy.builder()
                .owner(owner)
                .nominee(nominee)
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .waitingPeriodHours(dto.getWaitingPeriodHours() != null ? dto.getWaitingPeriodHours() : 24)
                .approvalType(dto.getApprovalType() != null ? dto.getApprovalType() : Policy.ApprovalType.OWNER_OR_ADMIN)
                .accessDurationHours(dto.getAccessDurationHours() != null ? dto.getAccessDurationHours() : 48)
                .policyExpiryDate(dto.getPolicyExpiryDate())
                .active(true)
                .build();

        Policy savedPolicy = policyRepository.save(policy);

        List<PolicyDocument> policyDocs = new ArrayList<>();
        for (Long docId : dto.getDocumentIds()) {
            Document doc = documentRepository.findByIdAndUserAndDeletedFalse(docId, owner)
                    .orElseThrow(() -> new ResourceNotFoundException("Document ID " + docId + " not found in your vault"));

            PolicyDocument pd = PolicyDocument.builder()
                    .policy(savedPolicy)
                    .document(doc)
                    .build();
            policyDocs.add(pd);
        }
        policyDocumentRepository.saveAll(policyDocs);
        savedPolicy.setPolicyDocuments(policyDocs);

        notificationService.createNotification(owner, "Policy Created",
                "Created emergency access policy '" + savedPolicy.getName() + "' for " + nominee.getName() + ".",
                Notification.NotificationType.POLICY, "/policies");

        auditLogService.logActivity(owner, ActivityLog.ActivityAction.CREATE_POLICY,
                "POLICY-" + savedPolicy.getId(), "Created policy: " + savedPolicy.getName() + " with " + policyDocs.size() + " documents", request);

        return mapToDto(savedPolicy);
    }

    @Transactional(readOnly = true)
    public List<PolicyRequest.PolicyDto> getOwnerPolicies(User owner) {
        return policyRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PolicyRequest.PolicyDto getPolicyById(User owner, Long policyId) {
        Policy policy = policyRepository.findByIdAndOwner(policyId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        return mapToDto(policy);
    }

    @Transactional
    public PolicyRequest.PolicyDto updatePolicy(User owner, Long policyId, PolicyRequest.UpdatePolicyDto dto, HttpServletRequest request) {
        Policy policy = policyRepository.findByIdAndOwner(policyId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        policy.setName(dto.getName().trim());
        policy.setDescription(dto.getDescription());
        if (dto.getWaitingPeriodHours() != null) {
            policy.setWaitingPeriodHours(dto.getWaitingPeriodHours());
        }
        if (dto.getApprovalType() != null) {
            policy.setApprovalType(dto.getApprovalType());
        }
        if (dto.getAccessDurationHours() != null) {
            policy.setAccessDurationHours(dto.getAccessDurationHours());
        }
        if (dto.getPolicyExpiryDate() != null) {
            policy.setPolicyExpiryDate(dto.getPolicyExpiryDate());
        }
        if (dto.getActive() != null) {
            policy.setActive(dto.getActive());
        }

        if (dto.getDocumentIds() != null && !dto.getDocumentIds().isEmpty()) {
            policyDocumentRepository.deleteByPolicy(policy);
            List<PolicyDocument> newDocs = new ArrayList<>();
            for (Long docId : dto.getDocumentIds()) {
                Document doc = documentRepository.findByIdAndUserAndDeletedFalse(docId, owner)
                        .orElseThrow(() -> new ResourceNotFoundException("Document ID " + docId + " not found"));
                newDocs.add(PolicyDocument.builder().policy(policy).document(doc).build());
            }
            policyDocumentRepository.saveAll(newDocs);
            policy.setPolicyDocuments(newDocs);
        }

        Policy updated = policyRepository.save(policy);
        auditLogService.logActivity(owner, ActivityLog.ActivityAction.UPDATE_POLICY,
                "POLICY-" + updated.getId(), "Updated policy: " + updated.getName(), request);

        return mapToDto(updated);
    }

    @Transactional
    public void deletePolicy(User owner, Long policyId, HttpServletRequest request) {
        Policy policy = policyRepository.findByIdAndOwner(policyId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        policyDocumentRepository.deleteByPolicy(policy);
        policyRepository.delete(policy);

        auditLogService.logActivity(owner, ActivityLog.ActivityAction.DELETE_POLICY,
                "POLICY-" + policyId, "Deleted policy: " + policy.getName(), request);
    }

    @Transactional
    public PolicyRequest.PolicyDto togglePolicyActive(User owner, Long policyId) {
        Policy policy = policyRepository.findByIdAndOwner(policyId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        policy.setActive(!policy.isActive());
        return mapToDto(policyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public List<PolicyRequest.PolicyDto> getAvailablePoliciesForNomineeUser(User nomineeUser) {
        List<Nominee> nominees = nomineeRepository.findByNomineeUser(nomineeUser);
        List<Policy> policies = new ArrayList<>();
        for (Nominee n : nominees) {
            policies.addAll(policyRepository.findByNomineeAndActiveTrue(n));
        }
        return policies.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public PolicyRequest.PolicyDto mapToDto(Policy policy) {
        List<PolicyDocument> pDocs = policyDocumentRepository.findByPolicy(policy);
        List<PolicyRequest.PolicyDocumentDto> docDtos = pDocs.stream()
                .map(pd -> PolicyRequest.PolicyDocumentDto.builder()
                        .documentId(pd.getDocument().getId())
                        .title(pd.getDocument().getTitle())
                        .categoryName(pd.getDocument().getCategory() != null ? pd.getDocument().getCategory().getName() : "Uncategorized")
                        .originalFilename(pd.getDocument().getOriginalFilename())
                        .fileSize(pd.getDocument().getFileSize())
                        .build())
                .collect(Collectors.toList());

        return PolicyRequest.PolicyDto.builder()
                .id(policy.getId())
                .name(policy.getName())
                .description(policy.getDescription())
                .nomineeId(policy.getNominee().getId())
                .nomineeName(policy.getNominee().getName())
                .nomineeEmail(policy.getNominee().getEmail())
                .waitingPeriodHours(policy.getWaitingPeriodHours())
                .approvalType(policy.getApprovalType())
                .accessDurationHours(policy.getAccessDurationHours())
                .policyExpiryDate(policy.getPolicyExpiryDate())
                .active(policy.isActive())
                .documents(docDtos)
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
