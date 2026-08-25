package com.lifeledger.service;

import com.lifeledger.dto.nominee.NomineeRequest;
import com.lifeledger.entity.*;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.exception.SecurityViolationException;
import com.lifeledger.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NomineeService {

    private final NomineeRepository nomineeRepository;
    private final NomineeInvitationRepository invitationRepository;
    private final NomineePermissionRepository permissionRepository;
    private final PolicyRepository policyRepository;
    private final DocumentRepository documentRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public NomineeRequest.NomineeDto addNominee(User owner, NomineeRequest.CreateNomineeDto dto, HttpServletRequest request) {
        String nomineeEmail = dto.getEmail().toLowerCase().trim();
        if (owner.getEmail().equalsIgnoreCase(nomineeEmail)) {
            throw new IllegalArgumentException("You cannot add yourself as a nominee");
        }

        String invitationToken = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        // Check if a registered user matches this email
        Optional<User> matchingUser = userRepository.findByEmail(nomineeEmail);

        Nominee nominee = Nominee.builder()
                .owner(owner)
                .nomineeUser(matchingUser.orElse(null))
                .name(dto.getName().trim())
                .email(nomineeEmail)
                .phone(dto.getPhone())
                .relationship(dto.getRelationship())
                .verificationStatus(matchingUser.isPresent() ? Nominee.VerificationStatus.INVITED : Nominee.VerificationStatus.PENDING)
                .invitationToken(invitationToken)
                .invitationExpiresAt(expiresAt)
                .notes(dto.getNotes())
                .build();

        Nominee saved = nomineeRepository.save(nominee);

        NomineeInvitation invitation = NomineeInvitation.builder()
                .nominee(saved)
                .token(invitationToken)
                .expiresAt(expiresAt)
                .accepted(false)
                .build();
        invitationRepository.save(invitation);

        // If documents/categories assigned directly
        if (dto.getDocumentIds() != null) {
            for (Long docId : dto.getDocumentIds()) {
                documentRepository.findByIdAndUser(docId, owner).ifPresent(doc -> {
                    NomineePermission perm = NomineePermission.builder()
                            .nominee(saved)
                            .document(doc)
                            .permissionType(NomineePermission.PermissionType.VIEW)
                            .build();
                    permissionRepository.save(perm);
                });
            }
        }

        notificationService.createNotification(owner, "Nominee Added",
                "You designated " + saved.getName() + " (" + saved.getEmail() + ") as a trusted nominee.",
                Notification.NotificationType.SYSTEM, "/nominees");

        auditLogService.logActivity(owner, ActivityLog.ActivityAction.ADD_NOMINEE,
                "NOMINEE-" + saved.getId(), "Designated trusted nominee: " + saved.getName(), request);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<NomineeRequest.NomineeDto> getOwnerNominees(User owner) {
        return nomineeRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NomineeRequest.NomineeDto getNomineeById(User owner, Long nomineeId) {
        Nominee nominee = nomineeRepository.findByIdAndOwner(nomineeId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));
        return mapToDto(nominee);
    }

    @Transactional
    public NomineeRequest.NomineeDto updateNominee(User owner, Long nomineeId, NomineeRequest.UpdateNomineeDto dto, HttpServletRequest request) {
        Nominee nominee = nomineeRepository.findByIdAndOwner(nomineeId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));

        nominee.setName(dto.getName().trim());
        nominee.setPhone(dto.getPhone());
        nominee.setRelationship(dto.getRelationship());
        nominee.setNotes(dto.getNotes());

        Nominee updated = nomineeRepository.save(nominee);
        auditLogService.logActivity(owner, ActivityLog.ActivityAction.UPDATE_NOMINEE,
                "NOMINEE-" + updated.getId(), "Updated nominee details: " + updated.getName(), request);

        return mapToDto(updated);
    }

    @Transactional
    public void deleteNominee(User owner, Long nomineeId, HttpServletRequest request) {
        Nominee nominee = nomineeRepository.findByIdAndOwner(nomineeId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));

        // Check if there are active policies linked
        List<Policy> policies = policyRepository.findByNominee(nominee);
        if (!policies.isEmpty()) {
            throw new IllegalArgumentException("Cannot remove nominee with active policies. Please reassign or delete associated policies first.");
        }

        permissionRepository.deleteByNominee(nominee);
        nomineeRepository.delete(nominee);

        auditLogService.logActivity(owner, ActivityLog.ActivityAction.REMOVE_NOMINEE,
                "NOMINEE-" + nomineeId, "Removed nominee: " + nominee.getName(), request);
    }

    @Transactional
    public String resendInvitation(User owner, Long nomineeId, HttpServletRequest request) {
        Nominee nominee = nomineeRepository.findByIdAndOwner(nomineeId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Nominee not found"));

        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        nominee.setInvitationToken(token);
        nominee.setInvitationExpiresAt(expiresAt);
        nominee.setVerificationStatus(Nominee.VerificationStatus.INVITED);
        nomineeRepository.save(nominee);

        NomineeInvitation invitation = NomineeInvitation.builder()
                .nominee(nominee)
                .token(token)
                .expiresAt(expiresAt)
                .accepted(false)
                .build();
        invitationRepository.save(invitation);

        auditLogService.logActivity(owner, ActivityLog.ActivityAction.UPDATE_NOMINEE,
                "NOMINEE-" + nomineeId, "Re-issued invitation for: " + nominee.getEmail(), request);

        return token;
    }

    @Transactional
    public NomineeRequest.NomineeDto acceptInvitation(String token, User authenticatedUser, HttpServletRequest request) {
        Nominee nominee = nomineeRepository.findByInvitationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired invitation token"));

        if (nominee.getInvitationExpiresAt() != null && nominee.getInvitationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This invitation token has expired. Please ask the vault owner to re-send the invitation.");
        }

        if (authenticatedUser != null) {
            nominee.setNomineeUser(authenticatedUser);
        }
        nominee.setVerificationStatus(Nominee.VerificationStatus.VERIFIED);
        nominee.setVerifiedAt(LocalDateTime.now());
        nominee.setInvitationToken(null);
        nominee.setInvitationExpiresAt(null);

        Nominee saved = nomineeRepository.save(nominee);

        invitationRepository.findByToken(token).ifPresent(inv -> {
            inv.setAccepted(true);
            inv.setAcceptedAt(LocalDateTime.now());
            invitationRepository.save(inv);
        });

        // Notify vault owner
        notificationService.createNotification(saved.getOwner(), "Nominee Verified",
                saved.getName() + " (" + saved.getEmail() + ") verified their nominee invitation.",
                Notification.NotificationType.EMERGENCY, "/nominees");

        auditLogService.logActivity(authenticatedUser != null ? authenticatedUser : saved.getOwner(),
                ActivityLog.ActivityAction.VERIFY_NOMINEE,
                "NOMINEE-" + saved.getId(), "Nominee verified: " + saved.getName(), request);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<NomineeRequest.NomineeDto> getDesignationsForUser(User user) {
        List<Nominee> byUser = nomineeRepository.findByNomineeUser(user);
        List<Nominee> byEmail = nomineeRepository.findByEmail(user.getEmail());
        Set<Nominee> combined = new HashSet<>(byUser);
        combined.addAll(byEmail);

        return combined.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public NomineeRequest.NomineeDto mapToDto(Nominee nominee) {
        long policyCount = policyRepository.findByNominee(nominee).size();
        long docCount = permissionRepository.findByNominee(nominee).size();

        return NomineeRequest.NomineeDto.builder()
                .id(nominee.getId())
                .name(nominee.getName())
                .email(nominee.getEmail())
                .phone(nominee.getPhone())
                .relationship(nominee.getRelationship())
                .verificationStatus(nominee.getVerificationStatus())
                .invitationToken(nominee.getInvitationToken())
                .invitationExpiresAt(nominee.getInvitationExpiresAt())
                .verifiedAt(nominee.getVerifiedAt())
                .notes(nominee.getNotes())
                .assignedPolicyCount(policyCount)
                .assignedDocumentCount(docCount)
                .createdAt(nominee.getCreatedAt())
                .updatedAt(nominee.getUpdatedAt())
                .build();
    }
}
